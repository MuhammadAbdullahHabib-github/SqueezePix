import JSZip from 'jszip';
import type { ProcessingResult } from '@/types/image';

export interface ZipOptions {
  includeMetadataJson?: boolean;
  includeMetadataCsv?: boolean;
}

export interface ImageMetadata {
  filename: string;
  originalFilename: string;
  altText?: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  format: string;
  width?: number;
  height?: number;
}

/**
 * Generate a ZIP file containing optimized images and optional metadata
 */
export async function generateZip(
  results: Array<{ name: string; result: ProcessingResult }>,
  options: ZipOptions = {}
): Promise<Blob> {
  const zip = new JSZip();

  // Add images to zip
  const metadata: ImageMetadata[] = [];

  for (const { name, result } of results) {
    zip.file(result.name, result.blob);

    metadata.push({
      filename: result.name,
      originalFilename: name,
      altText: result.altText,
      originalSize: result.originalSize,
      compressedSize: result.compressedSize,
      compressionRatio: result.compressionRatio,
      format: result.format,
      width: result.width,
      height: result.height,
    });
  }

  // Add metadata.json if requested
  if (options.includeMetadataJson) {
    const jsonContent = JSON.stringify(metadata, null, 2);
    zip.file('metadata.json', jsonContent);
  }

  // Add metadata.csv if requested
  if (options.includeMetadataCsv) {
    const csvContent = generateCsv(metadata);
    zip.file('metadata.csv', csvContent);
  }

  // Generate and return zip blob
  return zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}

/**
 * Generate CSV content from metadata
 */
function generateCsv(metadata: ImageMetadata[]): string {
  const headers = [
    'filename',
    'original_filename',
    'alt_text',
    'original_size',
    'compressed_size',
    'compression_ratio',
    'format',
    'width',
    'height',
  ];

  const rows = metadata.map((item) => [
    escapeCsvValue(item.filename),
    escapeCsvValue(item.originalFilename),
    escapeCsvValue(item.altText || ''),
    item.originalSize.toString(),
    item.compressedSize.toString(),
    item.compressionRatio.toFixed(2),
    item.format,
    item.width?.toString() || '',
    item.height?.toString() || '',
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

/**
 * Escape a value for CSV format
 */
function escapeCsvValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Download a zip file
 */
export function downloadZip(blob: Blob, filename = 'squeezepix-images.zip'): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
