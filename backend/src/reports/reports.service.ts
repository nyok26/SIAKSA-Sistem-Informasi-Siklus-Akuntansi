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

  // ── Shared aggregation base ─────────────────────────────────────────────────

  /**
   * Loads all accounts with their total debit/credit from both
   * general journal and adjusting entries.
   */
  private async loadAccountAggregates(companyId: string, startDate?: string, endDate?: string): Promise<AccountWithAggregates[]> {
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);
    
    const detailsWhere = Object.keys(dateFilter).length > 0 ? { date: dateFilter } : undefined;

    const accounts = await this.prisma.account.findMany({
      where: { companyId },
      orderBy: { account_code: 'asc' },
      include: {
        journalDetails: {
          where: detailsWhere ? { journalEntry: detailsWhere } : undefined,
          select: { debit: true, credit: true },
        },
        adjustingDetails: {
          where: detailsWhere ? { adjustingEntry: detailsWhere } : undefined,
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
      journalDebit: acc.journalDetails.reduce(
        (s, d) => s + Number(d.debit),
        0,
      ),
      journalCredit: acc.journalDetails.reduce(
        (s, d) => s + Number(d.credit),
        0,
      ),
      adjustingDebit: acc.adjustingDetails.reduce(
        (s, d) => s + Number(d.debit),
        0,
      ),
      adjustingCredit: acc.adjustingDetails.reduce(
        (s, d) => s + Number(d.credit),
        0,
      ),
    }));
  }

  /**
   * Computes the "trial balance" columns (debit_balance / credit_balance)
   * from raw debit/credit totals.
   *
   * Convention: net = totalDebit - totalCredit.
   *   If net >= 0 → show in debit column.
   *   If net  < 0 → show absolute value in credit column.
   */
  private toTrialBalanceCols(totalDebit: number, totalCredit: number) {
    const net = totalDebit - totalCredit;
    return {
      debit_balance: net >= 0 ? net : 0,
      credit_balance: net < 0 ? Math.abs(net) : 0,
    };
  }

  /** Contra-equity (e.g. Prive / Owner's Drawings): Equity category, debit normal balance. */
  private isContraEquityDrawing(acc: AccountWithAggregates): boolean {
    return acc.category === Category.Equity && acc.normal_balance === NormalBalance.Debit;
  }

  /**
   * Heuristic: drawings sometimes created under Expenses by mistake; they must not hit net income.
   */
  private isMisclassifiedDrawingAsExpense(acc: AccountWithAggregates): boolean {
    if (acc.category !== Category.Expenses) return false;
    const n = acc.account_name.toLowerCase();
    return /prive|drawing|penarikan\s*modal|tarik\s*modal|pengambilan\s*modal|owner'?s?\s*withdraw|modal\s*ditarik/.test(
      n,
    );
  }

  // ── 1. General Ledger ───────────────────────────────────────────────────────

  /** Returns full transaction history per account with running balance. */
  async getLedger(companyId: string, accountId?: string, startDate?: string, endDate?: string) {
    const where = accountId ? { id: accountId, companyId } : { companyId };

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);
    const detailsWhere = Object.keys(dateFilter).length > 0 ? { date: dateFilter } : undefined;

    const accounts = await this.prisma.account.findMany({
      where,
      orderBy: { account_code: 'asc' },
      include: {
        journalDetails: {
          where: detailsWhere ? { journalEntry: detailsWhere } : undefined,
          include: {
            journalEntry: {
              select: { id: true, date: true, description: true },
            },
          },
        },
        adjustingDetails: {
          where: detailsWhere ? { adjustingEntry: detailsWhere } : undefined,
          include: {
            adjustingEntry: {
              select: { id: true, date: true, description: true },
            },
          },
        },
      },
    });

    return accounts.map((acc) => {
      // Merge general journal + adjusting into a single list, sorted by date
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
      ].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );

      // Running balance (direction depends on normal balance)
      let balance = 0;
      const rows = transactions.map((t) => {
        if (acc.normal_balance === NormalBalance.Debit) {
          balance += t.debit - t.credit;
        } else {
          balance += t.credit - t.debit;
        }
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

  /**
   * @param adjusted - false = Unadjusted TB (journal only),
   *                   true  = Adjusted TB (journal + adjusting)
   */
  async getTrialBalance(companyId: string, adjusted: boolean, startDate?: string, endDate?: string) {
    const aggregates = await this.loadAccountAggregates(companyId, startDate, endDate);

    const rows = aggregates
      .map((acc) => {
        const totalDebit =
          acc.journalDebit + (adjusted ? acc.adjustingDebit : 0);
        const totalCredit =
          acc.journalCredit + (adjusted ? acc.adjustingCredit : 0);

        return {
          account_id: acc.id,
          account_code: acc.account_code,
          account_name: acc.account_name,
          category: acc.category,
          normal_balance: acc.normal_balance,
          ...this.toTrialBalanceCols(totalDebit, totalCredit),
        };
      })
      // Only include accounts with activity
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
        // ── Columns 1-2: Unadjusted Trial Balance ───────────────────────────
        const tb = this.toTrialBalanceCols(
          acc.journalDebit,
          acc.journalCredit,
        );

        // ── Columns 3-4: Adjustments ────────────────────────────────────────
        const adj_debit = acc.adjustingDebit;
        const adj_credit = acc.adjustingCredit;

        // ── Columns 5-6: Adjusted Trial Balance ─────────────────────────────
        const adjTb = this.toTrialBalanceCols(
          acc.journalDebit + acc.adjustingDebit,
          acc.journalCredit + acc.adjustingCredit,
        );

        // ── Columns 7-8 & 9-10: Allocate to IS or BS by category ───────────
        const countsTowardIncomeStatement =
          acc.category === Category.Revenue ||
          (acc.category === Category.Expenses && !this.isMisclassifiedDrawingAsExpense(acc));

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
          // Unadjusted TB
          tb_debit: tb.debit_balance,
          tb_credit: tb.credit_balance,
          // Adjustments (raw amounts, not net)
          adj_debit,
          adj_credit,
          // Adjusted TB
          adj_tb_debit: adjTb.debit_balance,
          adj_tb_credit: adjTb.credit_balance,
          // Income Statement
          is_debit,
          is_credit,
          // Balance Sheet
          bs_debit,
          bs_credit,
        };
      })
      .filter(
        (r) =>
          r.tb_debit + r.tb_credit + r.adj_debit + r.adj_credit > 0,
      );

    // Column totals
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

    // Net income plugs the gap in IS and BS totals
    const netIncome = totals.is_credit - totals.is_debit;

    return { rows, totals, net_income: netIncome };
  }

  // ── 4. Income Statement ─────────────────────────────────────────────────────

  async getIncomeStatement(companyId: string, startDate?: string, endDate?: string) {
    const aggregates = await this.loadAccountAggregates(companyId, startDate, endDate);

    const revenueAccounts = aggregates.filter(
      (a) => a.category === Category.Revenue,
    );
    const expenseAccounts = aggregates.filter(
      (a) =>
        a.category === Category.Expenses &&
        // Owner drawings mis-tagged as Expenses must not reduce net income.
        !this.isMisclassifiedDrawingAsExpense(a),
    );

    const mapToLine = (acc: AccountWithAggregates) => {
      const adjTb = this.toTrialBalanceCols(
        acc.journalDebit + acc.adjustingDebit,
        acc.journalCredit + acc.adjustingCredit,
      );
      // Revenue: normal credit → use credit_balance as the "amount"
      // Expenses: normal debit → use debit_balance as the "amount"
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
    const expenses = expenseAccounts
      .map(mapToLine)
      .filter((r) => r.amount > 0);

    const totalRevenue = revenue.reduce((s, r) => s + r.amount, 0);
    const totalExpenses = expenses.reduce((s, r) => s + r.amount, 0);
    const netIncome = totalRevenue - totalExpenses;

    return { revenue, expenses, totalRevenue, totalExpenses, netIncome };
  }

  // ── 5. Balance Sheet ────────────────────────────────────────────────────────

  async getBalanceSheet(companyId: string, startDate?: string, endDate?: string) {
    const aggregates = await this.loadAccountAggregates(companyId, startDate, endDate);
    const { netIncome } = await this.getIncomeStatement(companyId, startDate, endDate);

    const mapToLine = (acc: AccountWithAggregates) => {
      const adjTb = this.toTrialBalanceCols(
        acc.journalDebit + acc.adjustingDebit,
        acc.journalCredit + acc.adjustingCredit,
      );
      // Assets: normal debit → debit_balance
      // Liabilities/Equity: normal credit → credit_balance
      const amount =
        acc.normal_balance === NormalBalance.Debit
          ? adjTb.debit_balance - adjTb.credit_balance
          : adjTb.credit_balance - adjTb.debit_balance;

      return {
        account_id: acc.id,
        account_code: acc.account_code,
        account_name: acc.account_name,
        amount: Math.max(0, amount),
      };
    };

    const assets = aggregates
      .filter((a) => a.category === Category.Assets)
      .map(mapToLine)
      .filter((r) => r.amount > 0);

    const liabilities = aggregates
      .filter((a) => a.category === Category.Liabilities)
      .map(mapToLine)
      .filter((r) => r.amount > 0);

    const equity = aggregates
      .filter((a) => a.category === Category.Equity)
      .map(mapToLine)
      .filter((r) => r.amount > 0);

    const equityAccounts = aggregates.filter((a) => a.category === Category.Equity);
    // Credit-normal equity adds to capital; debit-normal (Prive / drawings) subtracts.
    const totalBaseEquity = equityAccounts.reduce((sum, acc) => {
      const line = mapToLine(acc);
      if (this.isContraEquityDrawing(acc)) {
        return sum - line.amount;
      }
      return sum + line.amount;
    }, 0);
    const totalAssets = assets.reduce((s, r) => s + r.amount, 0);
    const totalLiabilities = liabilities.reduce((s, r) => s + r.amount, 0);
    const totalEquity = totalBaseEquity + netIncome; // includes retained earnings

    return {
      assets,
      liabilities,
      equity,
      netIncome,
      totalAssets,
      totalLiabilities,
      totalBaseEquity,
      totalEquity,
      totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
    };
  }

  // ── 6. Dashboard Summary ────────────────────────────────────────────────────

  /**
   * Returns the key KPI numbers for the Dashboard Bento cards.
   * Combines balance sheet totals and income statement totals.
   */
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
