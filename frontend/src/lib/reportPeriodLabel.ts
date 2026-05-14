import type { DateRange } from '@/components/DateFilter';

function parseLocalYmd(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export type ReportPeriodLocale = 'id-ID' | 'en-US';

export function reportPeriodLocaleFromCurrency(currency?: string | null): ReportPeriodLocale {
  return currency === 'USD' ? 'en-US' : 'id-ID';
}

/**
 * Standard accounting period line for report headers (Indonesian or English).
 */
export function formatAccountingReportPeriod(
  range: DateRange,
  locale: ReportPeriodLocale = 'id-ID',
): string {
  if (!range.startDate || !range.endDate) {
    return locale === 'id-ID' ? 'Untuk seluruh periode' : 'For all periods';
  }

  const start = parseLocalYmd(range.startDate);
  const end = parseLocalYmd(range.endDate);
  const opts: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };
  const a = start.toLocaleDateString(locale, opts);
  const b = end.toLocaleDateString(locale, opts);

  if (range.startDate === range.endDate) {
    return locale === 'id-ID' ? `Per ${b}` : `As of ${b}`;
  }

  return locale === 'id-ID'
    ? `Untuk periode ${a} s.d. ${b}`
    : `For the period from ${a} to ${b}`;
}
