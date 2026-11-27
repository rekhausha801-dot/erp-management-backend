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
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CreatePayrollDto } from './dto/create-payroll.dto';
import { QueryPayrollDto } from './dto/query-payroll.dto';
import { UpdatePayrollDto } from './dto/update-payroll.dto';
import { PayrollService } from './payroll.service';

@ApiTags('Payroll')
@ApiBearerAuth()
@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.HR, Role.ACCOUNTANT)
  @ApiOperation({ summary: 'Generate monthly payroll and payslips' })
  generate(
    @CompanyId() companyId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreatePayrollDto,
  ) {
    return this.payrollService.generatePayroll(companyId, dto, userId);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.HR, Role.ACCOUNTANT)
  @ApiOperation({ summary: 'List payroll runs' })
  findAll(@CompanyId() companyId: string, @Query() query: QueryPayrollDto) {
    return this.payrollService.findAll(companyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payroll run with payslips' })
  findOne(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.payrollService.findOne(companyId, id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.HR, Role.ACCOUNTANT)
  @ApiOperation({ summary: 'Update payroll status or notes' })
  update(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePayrollDto,
  ) {
    return this.payrollService.update(companyId, id, dto);
  }
}
