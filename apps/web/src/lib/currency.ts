/**
 * Currency utility functions
 * Handles conversion between sen (integer) and rupiah (formatted string)
 */

/**
 * Convert sen (integer) to rupiah formatted string
 * @param sen - Amount in sen (integer)
 * @returns Formatted rupiah string (e.g., "Rp 50.000")
 */
export function formatCurrency(sen: number | null | undefined): string {
  if (sen === null || sen === undefined || isNaN(sen)) {
    return 'Rp 0';
  }

  const rupiah = sen / 100;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rupiah);
}

/**
 * Convert rupiah (number) to sen (integer)
 * @param rupiah - Amount in rupiah (number)
 * @returns Amount in sen (integer)
 */
export function rupiahToSen(rupiah: number): number {
  return Math.round(rupiah * 100);
}

/**
 * Convert sen (integer) to rupiah (number)
 * @param sen - Amount in sen (integer)
 * @returns Amount in rupiah (number)
 */
export function senToRupiah(sen: number): number {
  return sen / 100;
}

/**
 * Format currency without currency symbol
 * @param sen - Amount in sen (integer)
 * @returns Formatted number string (e.g., "50.000")
 */
export function formatNumber(sen: number | null | undefined): string {
  if (sen === null || sen === undefined || isNaN(sen)) {
    return '0';
  }

  const rupiah = sen / 100;
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rupiah);
}
