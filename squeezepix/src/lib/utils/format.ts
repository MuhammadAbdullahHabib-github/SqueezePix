/**
 * File size and number formatting utilities
 */

/**
 * Format bytes to human-readable string
 * @param bytes - Number of bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string like "1.5 MB"
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const absBytes = Math.abs(bytes);
  const sign = bytes < 0 ? '-' : '';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(absBytes) / Math.log(k));
  const index = Math.min(i, sizes.length - 1);

  return `${sign}${parseFloat((absBytes / Math.pow(k, index)).toFixed(dm))} ${sizes[index]}`;
}

/**
 * Format percentage with sign
 * @param value - Percentage value (0-100)
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted string like "-78%"
 */
export function formatPercentage(value: number, decimals = 0): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format compression savings
 * @param originalSize - Original file size in bytes
 * @param compressedSize - Compressed file size in bytes
 * @returns Object with formatted strings
 */
export function formatCompressionStats(originalSize: number, compressedSize: number) {
  const saved = originalSize - compressedSize;
  const percentage = originalSize > 0 ? (saved / originalSize) * 100 : 0;

  // Handle different compression scenarios
  let displayPercentage: string;
  let status: 'reduced' | 'unchanged' | 'increased';

  if (percentage > 1) {
    // File was reduced
    displayPercentage = `-${percentage.toFixed(0)}%`;
    status = 'reduced';
  } else if (percentage >= -1 && percentage <= 1) {
    // Essentially unchanged (within 1%)
    displayPercentage = '~0%';
    status = 'unchanged';
  } else {
    // File got larger
    displayPercentage = `+${Math.abs(percentage).toFixed(0)}%`;
    status = 'increased';
  }

  return {
    original: formatBytes(originalSize),
    compressed: formatBytes(compressedSize),
    saved: formatBytes(Math.abs(saved)),
    savedRaw: saved,
    percentage: displayPercentage,
    percentageValue: percentage,
    status,
  };
}

/**
 * Format population number with commas
 * @param population - Population number
 * @returns Formatted string like "8,336,817"
 */
export function formatPopulation(population: number): string {
  return population?.toLocaleString() ?? 'N/A';
}

/**
 * Truncate filename if too long
 * @param filename - Original filename
 * @param maxLength - Maximum length (default: 30)
 * @returns Truncated filename with ellipsis
 */
export function truncateFilename(filename: string, maxLength = 30): string {
  if (filename.length <= maxLength) return filename;

  const ext = filename.split('.').pop() || '';
  const name = filename.slice(0, filename.length - ext.length - 1);
  const availableLength = maxLength - ext.length - 4; // 4 for "..." and "."

  return `${name.slice(0, availableLength)}...${ext ? `.${ext}` : ''}`;
}
