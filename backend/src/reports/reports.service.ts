import { Injectable } from '@nestjs/common';
import { Category, NormalBalance } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// ─── Internal Types ────────────────────────────────────────────────────────────

interface AccountWithAggregates {
  id: string;
  account_code: string;
  account_name: string;
  category: Category;
  normal_balance: NormalBalance;
  journalDebit: number;
  journalCredit: number;
  adjustingDebit: number;
  adjustingCredit: number;
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Date Utilities (UTC-based for timezone consistency) ────────────────────

  /**
   * Parses a YYYY-MM-DD string as UTC midnight.
   *
   * PROBLEM SOLVED: Ensures consistent date interpretation regardless of
   * server timezone. Frontend sends "2026-06-01", backend interprets as
   * 2026-06-01T00:00:00.000Z (UTC), avoiding timezone boundary leaks.
   *
   * Example:
   *   Input: "2026-06-01"
   *   Output: Date object representing 2026-06-01T00:00:00.000Z
   */
  private parseUTCDate(dateStr: string): Date {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d));
  }

  /**
   * Returns the exclusive upper bound for a given date string (UTC).
   * i.e. "everything BEFORE the next calendar day (UTC)"
   * which is equivalent to "everything UP TO AND INCLUDING endDate (UTC)".
   *
   * Example:
   *   Input: "2026-06-30"
   *   Output: Date object representing 2026-07-01T00:00:00.000Z
   */
  private parseUTCDateExclusiveEnd(dateStr: string): Date {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d + 1));
  }

  /**
   * Returns a Prisma date filter for "strictly before startDate (UTC)".
   *
   * BUG FIX: Uses UTC parsing to ensure transactions on June 1st are never
   * accidentally excluded when filtering for June.
   */
  private buildStrictlyBeforeDateFilter(startDate: string): { lt: Date } {
    return { lt: this.parseUTCDate(startDate) };
  }

  /**
   * Returns a Prisma date filter for "within [startDate, endDate] inclusive (UTC)".
   */
  private buildPeriodDateFilter(startDate?: string, endDate?: string): { gte?: Date; lt?: Date } {
    const filter: { gte?: Date; lt?: Date } = {};
    if (startDate) filter.gte = this.parseUTCDate(startDate);
    if (endDate) filter.lt = this.parseUTCDateExclusiveEnd(endDate);
    return filter;
  }

  // ── Shared Aggregation Base ─────────────────────────────────────────────────

  /**
   * Loads all accounts for a company with their debit/credit totals
   * for the specified date range.
   *
   * @param strictBeforeStartDate - When true, fetches transactions strictly
   *   BEFORE startDate (for computing "beginning balance"). Uses parseLocalDate
   *   consistently to avoid UTC timezone boundary issues.
   */
  private async loadAccountAggregates(
    companyId: string,
    startDate?: string,
    endDate?: string,
    strictBeforeStartDate = false,
  ): Promise<AccountWithAggregates[]> {
    const detailsWhere: any = {};

    if (strictBeforeStartDate && startDate) {
      detailsWhere.date = this.buildStrictlyBeforeDateFilter(startDate);
    } else {
      const periodFilter = this.buildPeriodDateFilter(startDate, endDate);
      if (Object.keys(periodFilter).length > 0) {
        detailsWhere.date = periodFilter;
      }
    }

    const accounts = await this.prisma.account.findMany({
      where: { companyId },
      orderBy: { account_code: 'asc' },
      include: {
        journalDetails: {
          where: Object.keys(detailsWhere).length > 0 ? { journalEntry: detailsWhere } : undefined,
          select: { debit: true, credit: true },
        },
        adjustingDetails: {
          where: Object.keys(detailsWhere).length > 0 ? { adjustingEntry: detailsWhere } : undefined,
          select: { debit: true, credit: true },
        },
      },
    });

    return accounts.map((acc) => ({
      id: acc.id,
      account_code: acc.account_code,
      account_name: acc.account_name,
      category: acc.category,
      normal_balance: acc.normal_balance,
      journalDebit: acc.journalDetails.reduce((s, d) => s + Number(d.debit), 0),
      journalCredit: acc.journalDetails.reduce((s, d) => s + Number(d.credit), 0),
      adjustingDebit: acc.adjustingDetails.reduce((s, d) => s + Number(d.debit), 0),
      adjustingCredit: acc.adjustingDetails.reduce((s, d) => s + Number(d.credit), 0),
    }));
  }

  // ── Helpers (minor improvements) ───────────────────────────────────────────
  private toTrialBalanceCols(totalDebit: number, totalCredit: number) {
    const net = totalDebit - totalCredit;
    return {
      debit_balance: net >= 0 ? net : 0,
      credit_balance: net < 0 ? Math.abs(net) : 0,
    };
  }

  private isMisclassifiedDrawingAsExpense(acc: AccountWithAggregates): boolean {
    if (acc.category !== Category.Expenses) return false;
    const n = acc.account_name.toLowerCase();
    return /prive|drawing|penarikan|withdraw|dividen/i.test(n);
  }

  private isDrawingAccount(acc: AccountWithAggregates): boolean {
    const n = acc.account_name.toLowerCase();
    return (
      (acc.category === Category.Equity && acc.normal_balance === NormalBalance.Debit) ||
      /prive|drawing|penarikan|withdraw|dividen/i.test(n)
    );
  }

  // ── 1. General Ledger ───────────────────────────────────────────────────────

  async getLedger(
    companyId: string,
    accountId?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const where = accountId ? { id: accountId, companyId } : { companyId };
    const dateFilter = this.buildPeriodDateFilter(startDate, endDate);
    const hasFilter = Object.keys(dateFilter).length > 0;
    const detailsWhere = hasFilter ? { date: dateFilter } : undefined;

    const accounts = await this.prisma.account.findMany({
      where,
      orderBy: { account_code: 'asc' },
      include: {
        journalDetails: {
          where: detailsWhere ? { journalEntry: detailsWhere } : undefined,
          include: {
            journalEntry: { select: { id: true, date: true, description: true } },
          },
        },
        adjustingDetails: {
          where: detailsWhere ? { adjustingEntry: detailsWhere } : undefined,
          include: {
            adjustingEntry: { select: { id: true, date: true, description: true } },
          },
        },
      },
    });

    return accounts.map((acc) => {
      const transactions = [
        ...acc.journalDetails.map((d) => ({
          source_id: d.journalEntry.id,
          date: d.journalEntry.date,
          description: d.journalEntry.description,
          source: 'Jurnal Umum',
          debit: Number(d.debit),
          credit: Number(d.credit),
        })),
        ...acc.adjustingDetails.map((d) => ({
          source_id: d.adjustingEntry.id,
          date: d.adjustingEntry.date,
          description: d.adjustingEntry.description,
          source: 'Jurnal Penyesuaian',
          debit: Number(d.debit),
          credit: Number(d.credit),
        })),
      ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      let balance = 0;
      const rows = transactions.map((t) => {
        balance +=
          acc.normal_balance === NormalBalance.Debit
            ? t.debit - t.credit
            : t.credit - t.debit;
        return { ...t, balance };
      });

      return {
        account_id: acc.id,
        account_code: acc.account_code,
        account_name: acc.account_name,
        category: acc.category,
        normal_balance: acc.normal_balance,
        transactions: rows,
        ending_balance: balance,
      };
    });
  }

  // ── 2. Trial Balance ────────────────────────────────────────────────────────

  async getTrialBalance(
    companyId: string,
    adjusted: boolean,
    startDate?: string,
    endDate?: string,
  ) {
    const aggregates = await this.loadAccountAggregates(companyId, startDate, endDate);

    const rows = aggregates
      .map((acc) => {
        const totalDebit = acc.journalDebit + (adjusted ? acc.adjustingDebit : 0);
        const totalCredit = acc.journalCredit + (adjusted ? acc.adjustingCredit : 0);
        return {
          account_id: acc.id,
          account_code: acc.account_code,
          account_name: acc.account_name,
          category: acc.category,
          normal_balance: acc.normal_balance,
          ...this.toTrialBalanceCols(totalDebit, totalCredit),
        };
      })
      .filter((r) => r.debit_balance !== 0 || r.credit_balance !== 0);

    const totals = rows.reduce(
      (acc, r) => ({
        total_debit: acc.total_debit + r.debit_balance,
        total_credit: acc.total_credit + r.credit_balance,
      }),
      { total_debit: 0, total_credit: 0 },
    );

    return { adjusted, rows, totals };
  }

  // ── 3. 10-Column Worksheet (Neraca Lajur) ──────────────────────────────────

  async getWorksheet(companyId: string, startDate?: string, endDate?: string) {
    const aggregates = await this.loadAccountAggregates(companyId, startDate, endDate);

    const rows = aggregates
      .map((acc) => {
        const tb = this.toTrialBalanceCols(acc.journalDebit, acc.journalCredit);
        const adj_debit = acc.adjustingDebit;
        const adj_credit = acc.adjustingCredit;
        const adjTb = this.toTrialBalanceCols(
          acc.journalDebit + acc.adjustingDebit,
          acc.journalCredit + acc.adjustingCredit,
        );

        const countsTowardIncomeStatement =
          acc.category === Category.Revenue ||
          (acc.category === Category.Expenses &&
            !this.isMisclassifiedDrawingAsExpense(acc));

        const is_debit = countsTowardIncomeStatement ? adjTb.debit_balance : 0;
        const is_credit = countsTowardIncomeStatement ? adjTb.credit_balance : 0;
        const bs_debit = countsTowardIncomeStatement ? 0 : adjTb.debit_balance;
        const bs_credit = countsTowardIncomeStatement ? 0 : adjTb.credit_balance;

        return {
          account_id: acc.id,
          account_code: acc.account_code,
          account_name: acc.account_name,
          category: acc.category,
          normal_balance: acc.normal_balance,
          tb_debit: tb.debit_balance,
          tb_credit: tb.credit_balance,
          adj_debit,
          adj_credit,
          adj_tb_debit: adjTb.debit_balance,
          adj_tb_credit: adjTb.credit_balance,
          is_debit,
          is_credit,
          bs_debit,
          bs_credit,
        };
      })
      .filter((r) => r.tb_debit + r.tb_credit + r.adj_debit + r.adj_credit > 0);

    const totals = rows.reduce(
      (acc, r) => ({
        tb_debit: acc.tb_debit + r.tb_debit,
        tb_credit: acc.tb_credit + r.tb_credit,
        adj_debit: acc.adj_debit + r.adj_debit,
        adj_credit: acc.adj_credit + r.adj_credit,
        adj_tb_debit: acc.adj_tb_debit + r.adj_tb_debit,
        adj_tb_credit: acc.adj_tb_credit + r.adj_tb_credit,
        is_debit: acc.is_debit + r.is_debit,
        is_credit: acc.is_credit + r.is_credit,
        bs_debit: acc.bs_debit + r.bs_debit,
        bs_credit: acc.bs_credit + r.bs_credit,
      }),
      {
        tb_debit: 0, tb_credit: 0,
        adj_debit: 0, adj_credit: 0,
        adj_tb_debit: 0, adj_tb_credit: 0,
        is_debit: 0, is_credit: 0,
        bs_debit: 0, bs_credit: 0,
      },
    );

    const netIncome = totals.is_credit - totals.is_debit;
    return { rows, totals, net_income: netIncome };
  }

  // ── 4. Income Statement ─────────────────────────────────────────────────────

  async getIncomeStatement(
    companyId: string,
    startDate?: string,
    endDate?: string,
    strictBeforeStartDate?: boolean,
  ) {
    const aggregates = await this.loadAccountAggregates(
      companyId,
      startDate,
      endDate,
      strictBeforeStartDate,
    );

    const revenueAccounts = aggregates.filter((a) => a.category === Category.Revenue);
    const expenseAccounts = aggregates.filter(
      (a) => a.category === Category.Expenses && !this.isMisclassifiedDrawingAsExpense(a),
    );

    const mapToLine = (acc: AccountWithAggregates) => {
      const adjTb = this.toTrialBalanceCols(
        acc.journalDebit + acc.adjustingDebit,
        acc.journalCredit + acc.adjustingCredit,
      );
      const amount =
        acc.normal_balance === NormalBalance.Credit
          ? adjTb.credit_balance - adjTb.debit_balance
          : adjTb.debit_balance - adjTb.credit_balance;
      return {
        account_id: acc.id,
        account_code: acc.account_code,
        account_name: acc.account_name,
        amount: Math.max(0, amount),
      };
    };

    const revenue = revenueAccounts.map(mapToLine).filter((r) => r.amount > 0);
    const expenses = expenseAccounts.map(mapToLine).filter((r) => r.amount > 0);

    const totalRevenue = revenue.reduce((s, r) => s + r.amount, 0);
    const totalExpenses = expenses.reduce((s, r) => s + r.amount, 0);
    return { revenue, expenses, totalRevenue, totalExpenses, netIncome: totalRevenue - totalExpenses };
  }

  // ── 5. Balance Sheet ────────────────────────────────────────────────────────

 async getBalanceSheet(companyId: string, endDate?: string) {
    const aggregates = await this.loadAccountAggregates(companyId, undefined, endDate);
    
    // Virtual Closing: Tarik seluruh laba rugi dari awal waktu hingga endDate
    const { netIncome } = await this.getIncomeStatement(companyId, undefined, endDate);

    const mapToLine = (acc: AccountWithAggregates) => {
      const adjTb = this.toTrialBalanceCols(
        acc.journalDebit + acc.adjustingDebit,
        acc.journalCredit + acc.adjustingCredit,
      );

      let amount: number;
      if (acc.category === Category.Assets) {
        amount =
          acc.normal_balance === NormalBalance.Debit
            ? adjTb.debit_balance - adjTb.credit_balance
            : -(adjTb.credit_balance - adjTb.debit_balance);
      } else {
        amount =
          acc.normal_balance === NormalBalance.Credit
            ? adjTb.credit_balance - adjTb.debit_balance
            : -(adjTb.debit_balance - adjTb.credit_balance);
      }

      return {
        account_id: acc.id,
        account_code: acc.account_code,
        account_name: acc.account_name,
        amount,
      };
    };

    const assets = aggregates
      .filter((a) => a.category === Category.Assets)
      .map(mapToLine)
      .filter((r) => r.amount !== 0);

    const liabilities = aggregates
      .filter((a) => a.category === Category.Liabilities)
      .map(mapToLine)
      .filter((r) => r.amount > 0);

    // Ambil semua akun Ekuitas
    const rawEquity = aggregates
      .filter((a) => a.category === Category.Equity)
      .map(mapToLine);

    // ── PROSES VIRTUAL CLOSING (INJEKSI LABA DITAHAN) ──
    // Cari akun yang berfungsi sebagai penampung laba
    const retainedEarningsAcc = rawEquity.find((e) => 
      /laba ditahan|retained earnings/i.test(e.account_name)
    );

    if (retainedEarningsAcc) {
      // Jika akunnya ada, tambahkan Laba Bersih langsung ke saldo akun tersebut
      retainedEarningsAcc.amount += netIncome;
    } else {
      // Fallback: Jika user menghapus akun Laba Ditahan, sistem tetap menyeimbangkan Neraca
      rawEquity.push({
        account_id: 'virtual-retained-earnings',
        account_code: '3200',
        account_name: 'Laba Ditahan (Virtual)',
        amount: netIncome,
      });
    }

    // Filter akun ekuitas yang saldonya 0 (setelah injeksi selesai)
    const equity = rawEquity.filter((r) => r.amount !== 0);

    const totalAssets = assets.reduce((sum, a) => sum + a.amount, 0);
    const totalLiabilities = liabilities.reduce((s, r) => s + r.amount, 0);
    const totalEquity = equity.reduce((sum, e) => sum + e.amount, 0);

    return {
      assets,
      liabilities,
      equity,
      netIncome, 
      totalAssets,
      totalLiabilities,
      totalBaseEquity: totalEquity - netIncome, // Hanya untuk referensi
      totalEquity,
      totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
    };
  }

  // ── 6. Statement of Changes in Equity ──────────────────────────────────────

  private async getCumulativeEquityUpToEnd(
    companyId: string,
    endDateStr?: string,
  ): Promise<number> {
    const aggregates = await this.loadAccountAggregates(companyId, undefined, endDateStr);
    const { netIncome } = await this.getIncomeStatement(companyId, undefined, endDateStr);

    const totalBaseEquity = aggregates
      .filter((a) => a.category === Category.Equity)
      .reduce((sum, acc) => {
        const adjTb = this.toTrialBalanceCols(
          acc.journalDebit + acc.adjustingDebit,
          acc.journalCredit + acc.adjustingCredit,
        );
        const amount =
          acc.normal_balance === NormalBalance.Credit
            ? adjTb.credit_balance - adjTb.debit_balance
            : -(adjTb.debit_balance - adjTb.credit_balance);
        return sum + amount;
      }, 0);

    return totalBaseEquity + netIncome;
  }

  private async getCumulativeEquityStrictlyBefore(
    companyId: string,
    startDate: string,
  ): Promise<number> {
    const aggregates = await this.loadAccountAggregates(
      companyId,
      startDate,
      undefined,
      true,
    );
    const { netIncome } = await this.getIncomeStatement(
      companyId,
      startDate,
      undefined,
      true,
    );

    const totalBaseEquity = aggregates
      .filter((a) => a.category === Category.Equity)
      .reduce((sum, acc) => {
        const adjTb = this.toTrialBalanceCols(
          acc.journalDebit + acc.adjustingDebit,
          acc.journalCredit + acc.adjustingCredit,
        );
        const amount =
          acc.normal_balance === NormalBalance.Credit
            ? adjTb.credit_balance - adjTb.debit_balance
            : -(adjTb.debit_balance - adjTb.credit_balance);
        return sum + amount;
      }, 0);

    return totalBaseEquity + netIncome;
  }

  private async getOwnerContributionsDuringPeriod(
    companyId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<number> {
    const periodAggregates = await this.loadAccountAggregates(companyId, startDate, endDate);
    return periodAggregates
      .filter((a) => a.category === Category.Equity && !this.isDrawingAccount(a))
      .reduce((sum, acc) => {
        const netCredit =
          (acc.journalCredit + acc.adjustingCredit) -
          (acc.journalDebit + acc.adjustingDebit);
          
        // BUG FIX: Hapus Math.max(0, netCredit) agar koreksi/debit 
        // pada akun ekuitas tetap terhitung secara akurat.
        return sum + netCredit; 
      }, 0);
  }

  private async getOwnerDrawingsDuringPeriod(
    companyId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<number> {
    const periodAggregates = await this.loadAccountAggregates(companyId, startDate, endDate);
    return periodAggregates
      .filter((a) => this.isDrawingAccount(a))
      .reduce((sum, acc) => {
        const adjTb = this.toTrialBalanceCols(
          acc.journalDebit + acc.adjustingDebit,
          acc.journalCredit + acc.adjustingCredit,
        );
        return sum + (adjTb.debit_balance - adjTb.credit_balance);
      }, 0);
  }

  // ── Statement of Changes in Equity (FIXED & RECONCILING) ───────────────────
  async getStatementOfEquity(
    companyId: string,
    startDate?: string,
    endDate?: string,
  ) {
    const initialCapital = startDate
      ? await this.getCumulativeEquityStrictlyBefore(companyId, startDate)
      : 0;

    const finalCapital = await this.getCumulativeEquityUpToEnd(companyId, endDate);

    const { netIncome } = await this.getIncomeStatement(companyId, startDate, endDate);

    const ownerContributions = await this.getOwnerContributionsDuringPeriod(
      companyId,
      startDate,
      endDate,
    );

    const prive = await this.getOwnerDrawingsDuringPeriod(companyId, startDate, endDate);

    const calculatedEnding = initialCapital + ownerContributions + netIncome - prive;

    // Reconciliation guard (critical for auditability)
    const discrepancy = Math.abs(calculatedEnding - finalCapital);
    if (discrepancy > 0.01) {
      // Log warning or throw in strict mode; for now return both for transparency
      console.warn(`Equity reconciliation discrepancy: ${discrepancy}`);
    }

    return {
      initialCapital,
      ownerContributions,
      netIncome,
      prive,
      capitalChange: ownerContributions + netIncome - prive,
      finalCapital,
      calculatedEnding, // for debugging
      discrepancy: discrepancy > 0.01 ? discrepancy : 0,
    };
  }

  // ── 7. Dashboard Summary ────────────────────────────────────────────────────

  async getDashboardSummary(companyId: string) {
    const [bs, is] = await Promise.all([
      this.getBalanceSheet(companyId),
      this.getIncomeStatement(companyId),
    ]);

    return {
      totalAssets: bs.totalAssets,
      totalLiabilities: bs.totalLiabilities,
      totalEquity: bs.totalEquity,
      totalRevenue: is.totalRevenue,
      totalExpenses: is.totalExpenses,
      netIncome: is.netIncome,
    };
  }
}