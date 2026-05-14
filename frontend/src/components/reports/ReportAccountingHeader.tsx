import { cn } from '@/lib/utils';

export interface ReportAccountingHeaderProps {
  /** Active company legal / display name */
  companyName: string;
  /** Report title only (e.g. "Balance Sheet", "Adjusted Trial Balance") */
  reportTitle: string;
  /** Third line: period description */
  periodLabel: string;
  className?: string;
}

/**
 * Standard 3-line centered accounting report header (company → report → period).
 */
export function ReportAccountingHeader({
  companyName,
  reportTitle,
  periodLabel,
  className,
}: ReportAccountingHeaderProps) {
  const name = companyName.trim() || '—';

  return (
    <div
      className={cn(
        'border-b border-border/40 bg-slate-50/50 px-6 py-7 text-center',
        className,
      )}
    >
      <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{name}</h2>
      <h3 className="mt-1 text-lg font-bold text-slate-800">{reportTitle}</h3>
      <p className="mt-1.5 text-sm font-medium leading-relaxed text-slate-600 sm:text-[15px]">
        {periodLabel}
      </p>
    </div>
  );
}
