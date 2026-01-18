/**
 * Browser fingerprinting for machine identification
 * Creates a stable hash based on device/browser characteristics
 */

async function getCanvasFingerprint(): Promise<string> {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    canvas.width = 200;
    canvas.height = 50;

    // Draw text with specific styling
    ctx.textBaseline = 'alphabetic';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('SqueezePix,fingerprint', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('SqueezePix,fingerprint', 4, 17);

    return canvas.toDataURL();
  } catch {
    return '';
  }
}

function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl || !(gl instanceof WebGLRenderingContext)) return '';

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return '';

    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    return `${vendor}~${renderer}`;
  } catch {
    return '';
  }
}

function getAudioFingerprint(): Promise<string> {
  return new Promise((resolve) => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) {
        resolve('');
        return;
      }

      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const analyser = context.createAnalyser();
      const gainNode = context.createGain();
      const scriptProcessor = context.createScriptProcessor(4096, 1, 1);

      gainNode.gain.value = 0; // Mute
      oscillator.type = 'triangle';
      oscillator.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.start(0);

      scriptProcessor.onaudioprocess = (event) => {
        const output = event.inputBuffer.getChannelData(0);
        let sum = 0;
        for (let i = 0; i < output.length; i++) {
          sum += Math.abs(output[i]);
        }
        oscillator.disconnect();
        scriptProcessor.disconnect();
        context.close();
        resolve(sum.toString());
      };

      setTimeout(() => {
        resolve('');
      }, 100);
    } catch {
      resolve('');
    }
  });
}

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a device fingerprint
 * Combines multiple signals for a stable identifier
 */
export async function generateFingerprint(): Promise<string> {
  if (typeof window === 'undefined') return '';

  const components: string[] = [];

  // Screen info
  components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);
  components.push(screen.pixelDepth?.toString() || '');

  // Timezone
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);

  // Language
  components.push(navigator.language);
  components.push((navigator.languages || []).join(','));

  // Platform
  components.push(navigator.platform);

  // Hardware
  components.push(navigator.hardwareConcurrency?.toString() || '');
  components.push((navigator as any).deviceMemory?.toString() || '');

  // Touch support
  components.push(navigator.maxTouchPoints?.toString() || '0');

  // Canvas fingerprint
  const canvasFingerprint = await getCanvasFingerprint();
  components.push(canvasFingerprint);

  // WebGL fingerprint
  components.push(getWebGLFingerprint());

  // Audio fingerprint (optional, can be slow)
  // const audioFingerprint = await getAudioFingerprint();
  // components.push(audioFingerprint);

  // Plugins (limited in modern browsers)
  const plugins = Array.from(navigator.plugins || [])
    .map(p => p.name)
    .join(',');
  components.push(plugins);

  // Combine and hash
  const fingerprint = components.join('|||');
  return hashString(fingerprint);
}

/**
 * Get stored fingerprint or generate new one
 * Caches in sessionStorage for performance
 */
export async function getDeviceFingerprint(): Promise<string> {
  if (typeof window === 'undefined') return '';

  const CACHE_KEY = 'sp_device_fp';

  // Check cache first
  const cached = sessionStorage.getItem(CACHE_KEY);
  if (cached) return cached;

  // Generate new fingerprint
  const fingerprint = await generateFingerprint();

  // Cache it
  try {
    sessionStorage.setItem(CACHE_KEY, fingerprint);
  } catch {
    // Ignore storage errors
  }

  return fingerprint;
}
