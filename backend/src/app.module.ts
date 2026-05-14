import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AccountsModule } from './accounts/accounts.module';
import { JournalsModule } from './journals/journals.module';
import { AdjustingModule } from './adjusting/adjusting.module';
import { ReportsModule } from './reports/reports.module';
import { CompaniesModule } from './companies/companies.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AccountsModule,
    JournalsModule,
    AdjustingModule,
    ReportsModule,
    CompaniesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
