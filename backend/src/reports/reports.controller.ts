import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CompanyId } from '../common/decorators/company-id.decorator';
import { CompanyIdGuard } from '../common/guards/company-id.guard';
import { ReportsService } from './reports.service';

@UseGuards(JwtAuthGuard, CompanyIdGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * GET /api/reports/ledger
   * GET /api/reports/ledger?account_id=<uuid>   ← single account
   */
  @Get('ledger')
  getLedger(
    @CompanyId() companyId: string,
    @Query('account_id') accountId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getLedger(companyId, accountId, startDate, endDate);
  }

  /**
   * GET /api/reports/ledger/:account_id   ← alternative single-account route
   */
  @Get('ledger/:account_id')
  getLedgerForAccount(
    @Param('account_id', ParseUUIDPipe) accountId: string,
    @CompanyId() companyId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getLedger(companyId, accountId, startDate, endDate);
  }

  /**
   * GET /api/reports/trial-balance              ← Unadjusted
   * GET /api/reports/trial-balance?adjusted=true ← Adjusted
   */
  @Get('trial-balance')
  getTrialBalance(
    @CompanyId() companyId: string,
    @Query('adjusted') adjusted?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const isAdjusted = adjusted === 'true';
    return this.reportsService.getTrialBalance(companyId, isAdjusted, startDate, endDate);
  }

  /**
   * GET /api/reports/worksheet   ← Full 10-column Neraca Lajur
   */
  @Get('worksheet')
  getWorksheet(
    @CompanyId() companyId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getWorksheet(companyId, startDate, endDate);
  }

  /**
   * GET /api/reports/income-statement
   */
  @Get('income-statement')
  getIncomeStatement(
    @CompanyId() companyId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getIncomeStatement(companyId, startDate, endDate);
  }

  /**
   * GET /api/reports/balance-sheet
   * Note: Balance Sheet ignores startDate (it's a snapshot "As Of" endDate)
   */
  @Get('balance-sheet')
  getBalanceSheet(
    @CompanyId() companyId: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getBalanceSheet(companyId, endDate);
  }

  /**
   * GET /api/reports/statement-of-equity
   */
  @Get('statement-of-equity')
  getStatementOfEquity(
    @CompanyId() companyId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getStatementOfEquity(companyId, startDate, endDate);
  }

  /**
   * GET /api/reports/summary
   * Single endpoint for all Dashboard KPI cards.
   */
  @Get('summary')
  getDashboardSummary(
    @CompanyId() companyId: string,
  ) {
    return this.reportsService.getDashboardSummary(companyId);
  }
}
