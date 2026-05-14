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
import { JournalsService } from './journals.service';
import { CreateJournalDto } from './dto/create-journal.dto';

@UseGuards(JwtAuthGuard)
@Controller('journals')
export class JournalsController {
  constructor(private readonly journalsService: JournalsService) {}

  /** GET /api/journals?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD */
  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (!companyId) throw new BadRequestException('x-company-id header is required');
    return this.journalsService.findAll(companyId, startDate, endDate);
  }

  /** GET /api/journals/:id */
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Headers('x-company-id') companyId: string) {
    if (!companyId) throw new BadRequestException('x-company-id header is required');
    return this.journalsService.findOne(id, companyId);
  }

  /** POST /api/journals */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateJournalDto, @Headers('x-company-id') companyId: string) {
    if (!companyId) throw new BadRequestException('x-company-id header is required');
    return this.journalsService.create(dto, companyId);
  }

  /** DELETE /api/journals/:id */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseUUIDPipe) id: string, @Headers('x-company-id') companyId: string) {
    if (!companyId) throw new BadRequestException('x-company-id header is required');
    return this.journalsService.remove(id, companyId);
  }
}
