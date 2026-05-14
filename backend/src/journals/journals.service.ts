import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJournalDto } from './dto/create-journal.dto';

/** Include shape reused in findAll and findOne */
const JOURNAL_INCLUDE = {
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
export class JournalsService {
  constructor(private readonly prisma: PrismaService) { }

  // ── Validation helper ──────────────────────────────────────────────────────

  private validateBalance(details: CreateJournalDto['details']): void {
    const totalDebit = details.reduce((s, d) => s + d.debit, 0);
    const totalCredit = details.reduce((s, d) => s + d.credit, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      throw new BadRequestException(
        `Journal is not balanced — Total Debit: ${totalDebit.toLocaleString('id-ID')} ≠ ` +
        `Total Credit: ${totalCredit.toLocaleString('id-ID')}`,
      );
    }

    if (totalDebit <= 0) {
      throw new BadRequestException(
        'Journal must have at least one debit and one credit amount greater than 0',
      );
    }

    const hasDebit = details.some((d) => d.debit > 0);
    const hasCredit = details.some((d) => d.credit > 0);
    if (!hasDebit || !hasCredit) {
      throw new BadRequestException(
        'Journal must have at least one debit line and one credit line',
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

  /** GET /api/journals */
  async findAll(companyId: string, startDate?: string, endDate?: string) {
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    return this.prisma.journalEntry.findMany({
      where: {
        companyId,
        ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
      },
      include: JOURNAL_INCLUDE,
      orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
    });
  }

  /** GET /api/journals/:id */
  async findOne(id: string, companyId: string) {
    const entry = await this.prisma.journalEntry.findFirst({
      where: { id, companyId },
      include: JOURNAL_INCLUDE,
    });
    if (!entry) throw new NotFoundException(`Journal entry '${id}' not found`);
    return entry;
  }

  /** POST /api/journals */
  async create(dto: CreateJournalDto, companyId: string) {
    this.validateBalance(dto.details);

    const accountIds = dto.details.map((d) => d.account_id);
    await this.validateAccountIds(accountIds, companyId);

    return this.prisma.journalEntry.create({
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
      include: JOURNAL_INCLUDE,
    });
  }

  /** DELETE /api/journals/:id */
  async remove(id: string, companyId: string) {
    const entry = await this.prisma.journalEntry.findFirst({ where: { id, companyId } });
    if (!entry) throw new NotFoundException(`Journal entry '${id}' not found`);

    // Cascade delete is handled by Prisma schema (onDelete: Cascade on details)
    await this.prisma.journalEntry.delete({ where: { id } });
    return { message: 'Journal entry deleted successfully' };
  }
}
