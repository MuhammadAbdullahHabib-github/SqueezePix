/**
 * AI Alt Text Generation Service
 * Uses OpenRouter API with free Qwen models (OpenAI-compatible)
 */

export interface AltTextOptions {
  keywords?: string[];
  location?: {
    cityName?: string;
    adminName?: string;
    countryName?: string;
  };
  maxLength?: number;
}

export interface AltTextResult {
  altText: string;
  model: string;
  tokensUsed?: number;
}

/**
 * Convert image file to base64 data URL
 */
export async function imageToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Build the prompt for alt text generation
 */
export function buildAltTextPrompt(options: AltTextOptions): string {
  const hasKeywords = options.keywords && options.keywords.length > 0;
  const hasLocation = options.location?.cityName;

  const parts: string[] = [
    'Generate a concise, SEO-friendly alt text description for this image.',
    'The alt text should be 10-20 words, descriptive, and accessible.',
  ];

  // If user provided keywords, prioritize those
  if (hasKeywords) {
    parts.push(`Naturally incorporate these keywords: ${options.keywords!.join(', ')}.`);

    // Only add location if it makes sense with the keywords
    if (hasLocation) {
      const locationStr = [
        options.location!.cityName,
        options.location!.adminName,
      ].filter(Boolean).join(', ');
      parts.push(`If the image appears to be a local business or service, you may mention "${locationStr}".`);
    }
  } else if (hasLocation) {
    // No keywords but has location - use for local SEO
    const locationStr = [
      options.location!.cityName,
      options.location!.adminName,
      options.location!.countryName,
    ].filter(Boolean).join(', ');
    parts.push(`If relevant to the image content (e.g., local business, service, landmark), naturally mention the location "${locationStr}".`);
  }

  parts.push('Respond with ONLY the alt text, no quotes, no explanation, no prefix.');

  return parts.join(' ');
}

/**
 * Generate alt text using OpenRouter API with free Qwen model
 * This function is called from the server-side API route
 */
export async function generateAltTextFromAPI(
  imageBase64: string,
  options: AltTextOptions = {}
): Promise<AltTextResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY environment variable is not set');
  }

  // OpenRouter endpoint (OpenAI-compatible)
  const baseUrl = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
  // Use Molmo - free vision-language model from Allen AI
  const model = process.env.OPENROUTER_MODEL || 'allenai/molmo-2-8b:free';

  const prompt = buildAltTextPrompt(options);

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'SqueezePix',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: imageBase64,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
      max_tokens: 100,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
  }

  const data = await response.json();

  let altText = data.choices?.[0]?.message?.content?.trim() || '';

  // Clean up any thinking tags if present (some models include these)
  altText = altText.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

  const tokensUsed = data.usage?.total_tokens;

  return {
    altText,
    model,
    tokensUsed,
  };
}
