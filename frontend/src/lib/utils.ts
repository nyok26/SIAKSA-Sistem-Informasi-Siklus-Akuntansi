import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currencyCode: string = 'IDR'): string {
  const isUSD = currencyCode === 'USD';
  return new Intl.NumberFormat(isUSD ? 'en-US' : 'id-ID', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: isUSD ? 2 : 0,
  }).format(amount);
}

export function formatDate(dateStr: string | Date): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
