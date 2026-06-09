import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export type DateRange = { startDate?: string; endDate?: string };

interface DateFilterProps {
  onChange: (range: DateRange) => void;
}

export function DateFilter({ onChange }: DateFilterProps) {
  const [filterType, setFilterType] = useState('all');
  const [year, setYear] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    if (filterType === 'all') {
      onChange({ startDate: undefined, endDate: undefined });
      return;
    }

    const y = parseInt(year, 10);
    let startM = 0;
    let endM = 11;

    if (filterType === 'year') {
      startM = 0; endM = 11;
    } else if (filterType.startsWith('q')) {
      const q = parseInt(filterType.replace('q', ''), 10);
      startM = (q - 1) * 3; endM = startM + 2;
    } else if (filterType.startsWith('s')) {
      const s = parseInt(filterType.replace('s', ''), 10);
      startM = (s - 1) * 6; endM = startM + 5;
    } else if (filterType.startsWith('m')) {
      const m = parseInt(filterType.replace('m', ''), 10);
      startM = m - 1; endM = m - 1;
    }

    // FIX: Use UTC dates to avoid timezone boundary issues
    // Start: First day of the month at UTC midnight
    const start = new Date(Date.UTC(y, startM, 1));
    // End: Last day of the month at UTC midnight
    const end = new Date(Date.UTC(y, endM + 1, 0));

    const pad = (n: number) => n.toString().padStart(2, '0');

    onChange({
      startDate: `${start.getUTCFullYear()}-${pad(start.getUTCMonth() + 1)}-${pad(start.getUTCDate())}`,
      endDate: `${end.getUTCFullYear()}-${pad(end.getUTCMonth() + 1)}-${pad(end.getUTCDate())}`,
    });
  }, [filterType, year]);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      <Select value={filterType} onValueChange={setFilterType}>
        <SelectTrigger className="w-[180px] bg-white border-border/50 shadow-sm rounded-xl">
          <SelectValue placeholder="Filter period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Time</SelectItem>
          <SelectItem value="year">Full Year</SelectItem>
          <SelectItem value="s1">Semester 1 (Jan - Jun)</SelectItem>
          <SelectItem value="s2">Semester 2 (Jul - Dec)</SelectItem>
          <SelectItem value="q1">Quarter 1</SelectItem>
          <SelectItem value="q2">Quarter 2</SelectItem>
          <SelectItem value="q3">Quarter 3</SelectItem>
          <SelectItem value="q4">Quarter 4</SelectItem>
          <SelectItem value="m1">January</SelectItem>
          <SelectItem value="m2">February</SelectItem>
          <SelectItem value="m3">March</SelectItem>
          <SelectItem value="m4">April</SelectItem>
          <SelectItem value="m5">May</SelectItem>
          <SelectItem value="m6">June</SelectItem>
          <SelectItem value="m7">July</SelectItem>
          <SelectItem value="m8">August</SelectItem>
          <SelectItem value="m9">September</SelectItem>
          <SelectItem value="m10">October</SelectItem>
          <SelectItem value="m11">November</SelectItem>
          <SelectItem value="m12">December</SelectItem>
        </SelectContent>
      </Select>

      {filterType !== 'all' && (
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-[100px] bg-white border-border/50 shadow-sm rounded-xl">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 5 }).map((_, i) => {
              const y = (new Date().getFullYear() - i).toString();
              return <SelectItem key={y} value={y}>{y}</SelectItem>;
            })}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
