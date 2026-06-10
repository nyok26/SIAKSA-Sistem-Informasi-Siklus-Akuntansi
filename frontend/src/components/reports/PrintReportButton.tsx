import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { printReport } from '@/lib/utils';

interface PrintReportButtonProps {
  disabled?: boolean;
}

/** Opens the browser print dialog; add `no-print` via className on parent toolbars. */
export function PrintReportButton({ disabled }: PrintReportButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="gap-2 rounded-xl border-border/50 bg-white shadow-sm"
      disabled={disabled}
      onClick={() => printReport()}
    >
      <Printer className="h-4 w-4" />
      Print
    </Button>
  );
}
