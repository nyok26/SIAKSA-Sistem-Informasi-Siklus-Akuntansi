import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards, Headers, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReportsService } from './reports.service';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * GET /api/reports/ledger
   * GET /api/reports/ledger?account_id=<uuid>   ← single account
   */
  @Get('ledger')
  getLedger(
    @Headers('x-company-id') companyId: string,
    @Query('account_id') accountId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (!companyId) throw new BadRequestException('x-company-id header is required');
    return this.reportsService.getLedger(companyId, accountId, startDate, endDate);
  }

  /**
   * GET /api/reports/ledger/:account_id   ← alternative single-account route
   */
  @Get('ledger/:account_id')
  getLedgerForAccount(
    @Param('account_id', ParseUUIDPipe) accountId: string,
    @Headers('x-company-id') companyId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (!companyId) throw new BadRequestException('x-company-id header is required');
    return this.reportsService.getLedger(companyId, accountId, startDate, endDate);
  }

  /**
   * GET /api/reports/trial-balance              ← Unadjusted
   * GET /api/reports/trial-balance?adjusted=true ← Adjusted
   */
  @Get('trial-balance')
  getTrialBalance(
    @Headers('x-company-id') companyId: string,
    @Query('adjusted') adjusted?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (!companyId) throw new BadRequestException('x-company-id header is required');
    const isAdjusted = adjusted === 'true';
    return this.reportsService.getTrialBalance(companyId, isAdjusted, startDate, endDate);
  }

  /**
   * GET /api/reports/worksheet   ← Full 10-column Neraca Lajur
   */
  @Get('worksheet')
  getWorksheet(
    @Headers('x-company-id') companyId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (!companyId) throw new BadRequestException('x-company-id header is required');
    return this.reportsService.getWorksheet(companyId, startDate, endDate);
  }

  /**
   * GET /api/reports/income-statement
   */
  @Get('income-statement')
  getIncomeStatement(
    @Headers('x-company-id') companyId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (!companyId) throw new BadRequestException('x-company-id header is required');
    return this.reportsService.getIncomeStatement(companyId, startDate, endDate);
  }

  /**
   * GET /api/reports/balance-sheet
   * Note: Balance Sheet ignores startDate (it's a snapshot "As Of" endDate)
   */
  @Get('balance-sheet')
  getBalanceSheet(
    @Headers('x-company-id') companyId: string,
    @Query('endDate') endDate?: string,
  ) {
    if (!companyId) throw new BadRequestException('x-company-id header is required');
    return this.reportsService.getBalanceSheet(companyId, endDate);
  }

  /**
   * GET /api/reports/statement-of-equity
   */
  @Get('statement-of-equity')
  getStatementOfEquity(
    @Headers('x-company-id') companyId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (!companyId) throw new BadRequestException('x-company-id header is required');
    return this.reportsService.getStatementOfEquity(companyId, startDate, endDate);
  }

  /**
   * GET /api/reports/summary
   * Single endpoint for all Dashboard KPI cards.
   */
  @Get('summary')
  getDashboardSummary(
    @Headers('x-company-id') companyId: string,
  ) {
    if (!companyId) throw new BadRequestException('x-company-id header is required');
    return this.reportsService.getDashboardSummary(companyId);
  }
}
