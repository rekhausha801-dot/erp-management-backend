import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CompanyId } from '../common/decorators/company-id.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CreateAccountDto } from './dto/create-finance.dto';
import { QueryFinanceDto } from './dto/query-finance.dto';
import { UpdateFinanceDto } from './dto/update-finance.dto';
import { FinanceService } from './finance.service';

@ApiTags('Finance & Accounts')
@ApiBearerAuth()
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('summary')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.ACCOUNTANT)
  @ApiOperation({ summary: 'Get financial summary' })
  getSummary(@CompanyId() companyId: string) {
    return this.financeService.getSummary(companyId);
  }

  @Post('accounts')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.ACCOUNTANT)
  @ApiOperation({ summary: 'Create chart of accounts entry' })
  createAccount(
    @CompanyId() companyId: string,
    @Body() dto: CreateAccountDto,
  ) {
    return this.financeService.createAccount(companyId, dto);
  }

  @Get('accounts')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.ACCOUNTANT)
  @ApiOperation({ summary: 'List chart of accounts' })
  findAllAccounts(
    @CompanyId() companyId: string,
    @Query() query: QueryFinanceDto,
  ) {
    return this.financeService.findAllAccounts(companyId, query);
  }

  @Get('accounts/:id')
  @ApiOperation({ summary: 'Get account by ID' })
  findOneAccount(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.financeService.findOneAccount(companyId, id);
  }

  @Patch('accounts/:id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.ACCOUNTANT)
  @ApiOperation({ summary: 'Update account' })
  updateAccount(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateFinanceDto,
  ) {
    return this.financeService.updateAccount(companyId, id, dto);
  }
}
