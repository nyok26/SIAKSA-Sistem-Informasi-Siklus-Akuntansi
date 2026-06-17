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
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CompanyId } from '../common/decorators/company-id.decorator';
import { CompanyIdGuard } from '../common/guards/company-id.guard';
import { CreateJournalDto } from './dto/create-journal.dto';
import { JournalsService } from './journals.service';

@UseGuards(JwtAuthGuard, CompanyIdGuard)
@Controller('journals')
export class JournalsController {
  constructor(private readonly journalsService: JournalsService) {}

  /** GET /api/journals?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD */
  @Get()
  findAll(
    @CompanyId() companyId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.journalsService.findAll(companyId, startDate, endDate);
  }

  /** GET /api/journals/:id */
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CompanyId() companyId: string) {
    return this.journalsService.findOne(id, companyId);
  }

  /** POST /api/journals */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateJournalDto, @CompanyId() companyId: string) {
    return this.journalsService.create(dto, companyId);
  }

  /** DELETE /api/journals/:id */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseUUIDPipe) id: string, @CompanyId() companyId: string) {
    return this.journalsService.remove(id, companyId);
  }
}
