// frontend/src/utils/format.ts

/**
 * Format bytes to human-readable string (KB, MB, GB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Safely format date with fallback for invalid dates
 */
export function formatDate(dateString: string | Date | null | undefined, locale = 'ar-EG', options?: Intl.DateTimeFormatOptions): string {
  if (!dateString) return 'غير محدد';
  
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'تاريخ غير صالح';
    }
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options,
    };
    
    return date.toLocaleDateString(locale, defaultOptions);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'تاريخ غير صالح';
  }
}

/**
 * Format date with time
 */
export function formatDateTime(dateString: string | Date | null | undefined, locale = 'ar-EG'): string {
  return formatDate(dateString, locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
