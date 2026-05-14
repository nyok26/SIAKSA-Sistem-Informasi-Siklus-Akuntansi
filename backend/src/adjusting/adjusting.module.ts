import { Module } from '@nestjs/common';
import { AdjustingService } from './adjusting.service';
import { AdjustingController } from './adjusting.controller';

@Module({
  controllers: [AdjustingController],
  providers: [AdjustingService],
  exports: [AdjustingService],
})
export class AdjustingModule {}
