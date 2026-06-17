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
import { AdjustingService } from './adjusting.service';
import { CreateAdjustingDto } from './dto/create-adjusting.dto';

@UseGuards(JwtAuthGuard, CompanyIdGuard)
@Controller('adjusting')
export class AdjustingController {
  constructor(private readonly adjustingService: AdjustingService) {}

  /** GET /api/adjusting */
  @Get()
  findAll(
    @CompanyId() companyId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adjustingService.findAll(companyId, startDate, endDate);
  }

  /** GET /api/adjusting/:id */
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CompanyId() companyId: string) {
    return this.adjustingService.findOne(id, companyId);
  }

  /** POST /api/adjusting */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateAdjustingDto, @CompanyId() companyId: string) {
    return this.adjustingService.create(dto, companyId);
  }

  /** DELETE /api/adjusting/:id */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseUUIDPipe) id: string, @CompanyId() companyId: string) {
    return this.adjustingService.remove(id, companyId);
  }
}
