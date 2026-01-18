import { NextRequest, NextResponse } from 'next/server';
import { generateAltTextFromAPI, type AltTextOptions } from '@/lib/ai/qwen-vl';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageBase64, options } = body as {
      imageBase64: string;
      options?: AltTextOptions;
    };

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'imageBase64 is required' },
        { status: 400 }
      );
    }

    // Validate base64 format
    if (!imageBase64.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'Invalid image format. Expected base64 data URL.' },
        { status: 400 }
      );
    }

    const result = await generateAltTextFromAPI(imageBase64, options || {});

    return NextResponse.json(result);
  } catch (error) {
    console.error('Alt text generation error:', error);

    const message = error instanceof Error ? error.message : 'Unknown error';

    // Check for API key missing
    if (message.includes('API_KEY')) {
      return NextResponse.json(
        { error: 'AI service not configured. Please add OPENROUTER_API_KEY to environment.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: `Failed to generate alt text: ${message}` },
      { status: 500 }
    );
  }
}
