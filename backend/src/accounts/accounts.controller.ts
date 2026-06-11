import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CompanyId } from '../common/decorators/company-id.decorator';
import { CompanyIdGuard } from '../common/guards/company-id.guard';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@UseGuards(JwtAuthGuard, CompanyIdGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  /** GET /api/accounts */
  @Get()
  findAll(@CompanyId() companyId: string) {
    return this.accountsService.findAll(companyId);
  }

  /** GET /api/accounts/:id */
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CompanyId() companyId: string) {
    return this.accountsService.findOne(id, companyId);
  }

  /** POST /api/accounts */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateAccountDto, @CompanyId() companyId: string) {
    return this.accountsService.create(dto, companyId);
  }

  /** PATCH /api/accounts/:id */
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAccountDto,
    @CompanyId() companyId: string,
  ) {
    return this.accountsService.update(id, dto, companyId);
  }

  /** DELETE /api/accounts/:id */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseUUIDPipe) id: string, @CompanyId() companyId: string) {
    return this.accountsService.remove(id, companyId);
  }
}
