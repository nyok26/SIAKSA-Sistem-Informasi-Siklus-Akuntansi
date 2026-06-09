import { Injectable, NotFoundException } from '@nestjs/common';
import { Category, NormalBalance } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCompanyDto: CreateCompanyDto, userId: string) {
    const currency = createCompanyDto.currency || 'IDR';
    const isIDR = currency === 'IDR';

    const defaultAccounts = [
      {
        account_code: '311',
        account_name: isIDR ? 'Modal Pemilik' : "Owner's Capital",
        category: Category.Equity,
        normal_balance: NormalBalance.Credit,
      },
      {
        account_code: '312',
        account_name: isIDR ? 'Prive Pemilik' : "Owner's Drawings",
        category: Category.Equity,
        normal_balance: NormalBalance.Debit,
      },
      {
        // Akun krusial untuk Virtual Closing
        account_code: '321',
        account_name: isIDR ? 'Laba Ditahan' : 'Retained Earnings',
        category: Category.Equity,
        normal_balance: NormalBalance.Credit,
      },
    ];
    
    return this.prisma.$transaction(async (tx) => {
      // 1. Buat perusahaannya
      const newCompany = await tx.company.create({
        data: {
          name: createCompanyDto.name,
          currency: currency,
          ownerId: userId,
        },
      });

      // 2. Petakan akun default dengan ID perusahaan yang baru lahir
      const accountsToCreate = defaultAccounts.map((acc) => ({
        ...acc,
        companyId: newCompany.id,
      }));

      // 3. Suntikkan (inject) akun ke database
      await tx.account.createMany({
        data: accountsToCreate,
      });

      // 4. Kembalikan data perusahaan ke Controller
      return newCompany;
    });
  }

  findAll(userId: string) {
    return this.prisma.company.findMany({
      where: { ownerId: userId },
    });
  }

  async findOne(id: string, userId: string) {
    const company = await this.prisma.company.findFirst({
      where: { id, ownerId: userId },
    });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.company.update({
      where: { id },
      data: updateCompanyDto,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.company.delete({
      where: { id },
    });
  }
}
