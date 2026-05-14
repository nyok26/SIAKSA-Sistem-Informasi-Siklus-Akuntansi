import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';

@Module({
  controllers: [AccountsController],
  providers: [AccountsService],
  exports: [AccountsService],  // Exported so ReportsModule can reuse account data
})
export class AccountsModule {}
