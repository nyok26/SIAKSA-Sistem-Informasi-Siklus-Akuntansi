import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdjustingService } from './adjusting.service';
import { CreateAdjustingDto } from './dto/create-adjusting.dto';

@UseGuards(JwtAuthGuard)
@Controller('adjusting')
export class AdjustingController {
  constructor(private readonly adjustingService: AdjustingService) {}

  /** GET /api/adjusting */
  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (!companyId) throw new BadRequestException('x-company-id header is required');
    return this.adjustingService.findAll(companyId, startDate, endDate);
  }

  /** GET /api/adjusting/:id */
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Headers('x-company-id') companyId: string) {
    if (!companyId) throw new BadRequestException('x-company-id header is required');
    return this.adjustingService.findOne(id, companyId);
  }

  /** POST /api/adjusting */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateAdjustingDto, @Headers('x-company-id') companyId: string) {
    if (!companyId) throw new BadRequestException('x-company-id header is required');
    return this.adjustingService.create(dto, companyId);
  }

  /** DELETE /api/adjusting/:id */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseUUIDPipe) id: string, @Headers('x-company-id') companyId: string) {
    if (!companyId) throw new BadRequestException('x-company-id header is required');
    return this.adjustingService.remove(id, companyId);
  }
}
