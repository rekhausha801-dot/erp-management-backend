import {
  Body,
  Controller,
  Delete,
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
import { CreateDepartmentDto } from './dto/create-department.dto';
import { CreateDesignationDto } from './dto/create-designation.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { QueryEmployeeDto } from './dto/query-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeesService } from './employees.service';

@ApiTags('Employees & HR')
@ApiBearerAuth()
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Create an employee' })
  create(@CompanyId() companyId: string, @Body() dto: CreateEmployeeDto) {
    return this.employeesService.create(companyId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List employees with pagination and filtering' })
  findAll(@CompanyId() companyId: string, @Query() query: QueryEmployeeDto) {
    return this.employeesService.findAll(companyId, query);
  }

  @Post('departments')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Create department' })
  createDepartment(
    @CompanyId() companyId: string,
    @Body() dto: CreateDepartmentDto,
  ) {
    return this.employeesService.createDepartment(companyId, dto);
  }

  @Get('departments')
  @ApiOperation({ summary: 'List departments' })
  findDepartments(@CompanyId() companyId: string) {
    return this.employeesService.findDepartments(companyId);
  }

  @Post('designations')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Create designation' })
  createDesignation(
    @CompanyId() companyId: string,
    @Body() dto: CreateDesignationDto,
  ) {
    return this.employeesService.createDesignation(companyId, dto);
  }

  @Get('designations')
  @ApiOperation({ summary: 'List designations' })
  findDesignations(@CompanyId() companyId: string) {
    return this.employeesService.findDesignations(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID' })
  findOne(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.employeesService.findOne(companyId, id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Update employee' })
  update(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(companyId, id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Deactivate employee' })
  remove(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.employeesService.remove(companyId, id);
  }
}
