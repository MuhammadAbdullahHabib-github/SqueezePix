/**
 * Client-side function to generate alt text via API
 */

import { imageToBase64, type AltTextOptions, type AltTextResult } from './qwen-vl';

/**
 * Generate alt text for an image file
 * Calls the server API which uses Qwen VL
 */
export async function generateAltText(
  file: File | Blob,
  options: AltTextOptions = {}
): Promise<AltTextResult> {
  // Convert image to base64
  const imageBase64 = await imageToBase64(file);

  // Call API
  const response = await fetch('/api/generate-alt-text', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      imageBase64,
      options,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate alt text');
  }

  return response.json();
}

/**
 * Check if AI alt text service is available
 */
export async function checkAltTextServiceAvailable(): Promise<boolean> {
  try {
    // We could add a health check endpoint, for now just return true
    // The actual check happens when we try to generate
    return true;
  } catch {
    return false;
  }
}
