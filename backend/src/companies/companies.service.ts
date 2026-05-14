import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  create(createCompanyDto: CreateCompanyDto, userId: string) {
    return this.prisma.company.create({
      data: {
        name: createCompanyDto.name,
        currency: createCompanyDto.currency || 'IDR',
        ownerId: userId,
      },
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
