import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Category } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

/** Maps account category to its required leading digit */
const CATEGORY_PREFIX: Record<Category, string> = {
  Assets: '1',
  Liabilities: '2',
  Equity: '3',
  Revenue: '4',
  Expenses: '5',
};

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Helpers ────────────────────────────────────────────────────────────────

  private validatePrefix(account_code: string, category: Category): void {
    const expected = CATEGORY_PREFIX[category];
    if (!account_code.startsWith(expected)) {
      throw new BadRequestException(
        `Account code for "${category}" must start with '${expected}'. ` +
          `Received: '${account_code}'.`,
      );
    }
  }

  private async assertCodeUnique(
    account_code: string,
    companyId: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.prisma.account.findUnique({
      where: { companyId_account_code: { account_code, companyId } },
      select: { id: true },
    });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException(
        `Account code '${account_code}' is already in use`,
      );
    }
  }

  private async findOrThrow(id: string, companyId: string) {
    const account = await this.prisma.account.findFirst({ where: { id, companyId } });
    if (!account) {
      throw new NotFoundException(`Account with id '${id}' not found`);
    }
    return account;
  }

  // ── CRUD ───────────────────────────────────────────────────────────────────

  /** GET /api/accounts — list all, sorted by account_code */
  async findAll(companyId: string) {
    return this.prisma.account.findMany({
      where: { companyId },
      orderBy: { account_code: 'asc' },
    });
  }

  /** GET /api/accounts/:id */
  async findOne(id: string, companyId: string) {
    return this.findOrThrow(id, companyId);
  }

  /** POST /api/accounts */
  async create(dto: CreateAccountDto, companyId: string) {
    this.validatePrefix(dto.account_code, dto.category);
    await this.assertCodeUnique(dto.account_code, companyId);

    return this.prisma.account.create({
      data: {
        account_code: dto.account_code,
        account_name: dto.account_name,
        category: dto.category,
        normal_balance: dto.normal_balance,
        companyId,
      },
    });
  }

  /** PATCH /api/accounts/:id */
  async update(id: string, dto: UpdateAccountDto, companyId: string) {
    const existing = await this.findOrThrow(id, companyId);

    // Determine the effective category and code after partial update
    const effectiveCategory = dto.category ?? existing.category;
    const effectiveCode = dto.account_code ?? existing.account_code;

    // Re-validate prefix if either category or code changed
    if (dto.category || dto.account_code) {
      this.validatePrefix(effectiveCode, effectiveCategory);
    }

    // Check uniqueness only if code is being changed
    if (dto.account_code && dto.account_code !== existing.account_code) {
      await this.assertCodeUnique(dto.account_code, companyId, id);
    }

    return this.prisma.account.update({
      where: { id },
      data: {
        ...(dto.account_code && { account_code: dto.account_code }),
        ...(dto.account_name && { account_name: dto.account_name }),
        ...(dto.category && { category: dto.category }),
        ...(dto.normal_balance && { normal_balance: dto.normal_balance }),
      },
    });
  }

  /** DELETE /api/accounts/:id */
  async remove(id: string, companyId: string) {
    await this.findOrThrow(id, companyId);

    // Guard: prevent deleting accounts that have journal entries
    const usageCount = await this.prisma.journalDetail.count({
      where: { accountId: id },
    });
    const adjustingCount = await this.prisma.adjustingDetail.count({
      where: { accountId: id },
    });

    if (usageCount > 0 || adjustingCount > 0) {
      throw new BadRequestException(
        `Cannot delete account — it is referenced by ${usageCount + adjustingCount} journal line(s). ` +
          'Remove the journal entries first.',
      );
    }

    await this.prisma.account.delete({ where: { id } });
    return { message: 'Account deleted successfully' };
  }
}
