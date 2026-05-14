import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdjustingDto } from './dto/create-adjusting.dto';

const ADJUSTING_INCLUDE = {
  details: {
    include: {
      account: {
        select: {
          id: true,
          account_code: true,
          account_name: true,
          category: true,
          normal_balance: true,
        },
      },
    },
  },
};

@Injectable()
export class AdjustingService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Validation helpers ─────────────────────────────────────────────────────

  private validateBalance(details: CreateAdjustingDto['details']): void {
    const totalDebit = details.reduce((s, d) => s + d.debit, 0);
    const totalCredit = details.reduce((s, d) => s + d.credit, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      throw new BadRequestException(
        `Adjusting entry is not balanced — Total Debit: ${totalDebit.toLocaleString('id-ID')} ≠ ` +
          `Total Credit: ${totalCredit.toLocaleString('id-ID')}`,
      );
    }

    if (totalDebit <= 0) {
      throw new BadRequestException(
        'Adjusting entry must have amounts greater than 0',
      );
    }

    const hasDebit = details.some((d) => d.debit > 0);
    const hasCredit = details.some((d) => d.credit > 0);
    if (!hasDebit || !hasCredit) {
      throw new BadRequestException(
        'Adjusting entry must have at least one debit line and one credit line',
      );
    }
  }

  private async validateAccountIds(accountIds: string[], companyId: string): Promise<void> {
    const found = await this.prisma.account.findMany({
      where: { 
        id: { in: accountIds },
        companyId
      },
      select: { id: true },
    });
    if (found.length !== accountIds.length) {
      const foundIds = new Set(found.map((a) => a.id));
      const missing = accountIds.filter((id) => !foundIds.has(id));
      throw new BadRequestException(
        `Account(s) not found: ${missing.join(', ')}`,
      );
    }
  }

  // ── CRUD ───────────────────────────────────────────────────────────────────

  /** GET /api/adjusting */
  async findAll(companyId: string, startDate?: string, endDate?: string) {
    const whereClause: any = { companyId };
    
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = new Date(startDate);
      if (endDate) whereClause.date.lte = new Date(endDate);
    }

    return this.prisma.adjustingEntry.findMany({
      where: whereClause,
      include: ADJUSTING_INCLUDE,
      orderBy: { date: 'desc' },
    });
  }

  /** GET /api/adjusting/:id */
  async findOne(id: string, companyId: string) {
    const entry = await this.prisma.adjustingEntry.findFirst({
      where: { id, companyId },
      include: ADJUSTING_INCLUDE,
    });
    if (!entry)
      throw new NotFoundException(`Adjusting entry '${id}' not found`);
    return entry;
  }

  /** POST /api/adjusting */
  async create(dto: CreateAdjustingDto, companyId: string) {
    this.validateBalance(dto.details);

    const accountIds = dto.details.map((d) => d.account_id);
    await this.validateAccountIds(accountIds, companyId);

    return this.prisma.adjustingEntry.create({
      data: {
        date: new Date(dto.date),
        description: dto.description,
        companyId,
        details: {
          create: dto.details.map((d) => ({
            accountId: d.account_id,
            debit: d.debit,
            credit: d.credit,
          })),
        },
      },
      include: ADJUSTING_INCLUDE,
    });
  }

  /** DELETE /api/adjusting/:id */
  async remove(id: string, companyId: string) {
    const entry = await this.prisma.adjustingEntry.findFirst({
      where: { id, companyId },
    });
    if (!entry)
      throw new NotFoundException(`Adjusting entry '${id}' not found`);

    await this.prisma.adjustingEntry.delete({ where: { id } });
    return { message: 'Adjusting entry deleted successfully' };
  }
}
