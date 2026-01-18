/**
 * Web Worker for parallel image processing
 * Handles compression, WebP conversion, and EXIF removal
 */

import imageCompression from 'browser-image-compression';

export interface WorkerMessage {
  type: 'process';
  id: string;
  file: File;
  options: ProcessingOptions;
}

export interface ProcessingOptions {
  quality: number;
  convertToWebp: boolean;
  removeExif: boolean;
  maxWidth?: number;
  maxHeight?: number;
}

export interface WorkerResponse {
  type: 'progress' | 'complete' | 'error';
  id: string;
  progress?: number;
  result?: {
    blob: Blob;
    name: string;
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    format: string;
  };
  error?: string;
}

self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { type, id, file, options } = event.data;

  if (type !== 'process') return;

  try {
    // Report start
    self.postMessage({
      type: 'progress',
      id,
      progress: 10,
    } as WorkerResponse);

    const compressionOptions = {
      maxSizeMB: 10,
      maxWidthOrHeight: Math.max(options.maxWidth || 4096, options.maxHeight || 4096),
      useWebWorker: false, // Already in a worker
      initialQuality: options.quality / 100,
      fileType: options.convertToWebp ? ('image/webp' as const) : undefined,
    };

    // Report compression starting
    self.postMessage({
      type: 'progress',
      id,
      progress: 30,
    } as WorkerResponse);

    const compressedFile = await imageCompression(file, compressionOptions);

    // Report compression done
    self.postMessage({
      type: 'progress',
      id,
      progress: 80,
    } as WorkerResponse);

    // Determine output format and name
    const format = options.convertToWebp ? 'webp' : getFormat(compressedFile.type);
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const extension = format === 'jpeg' ? 'jpg' : format;
    const outputName = `${baseName}_optimized.${extension}`;

    const result = {
      blob: compressedFile,
      name: outputName,
      originalSize: file.size,
      compressedSize: compressedFile.size,
      compressionRatio: ((file.size - compressedFile.size) / file.size) * 100,
      format,
    };

    self.postMessage({
      type: 'complete',
      id,
      progress: 100,
      result,
    } as WorkerResponse);
  } catch (error) {
    self.postMessage({
      type: 'error',
      id,
      error: error instanceof Error ? error.message : 'Unknown error',
    } as WorkerResponse);
  }
};

function getFormat(mimeType: string): string {
  switch (mimeType) {
    case 'image/jpeg':
      return 'jpeg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/gif':
      return 'gif';
    default:
      return 'jpeg';
  }
}

export {};
