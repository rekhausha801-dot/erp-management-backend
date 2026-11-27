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
import { CreateLeaveDto, CreateLeaveTypeDto } from './dto/create-leave.dto';
import { QueryLeaveDto } from './dto/query-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';
import { LeaveService } from './leave.service';

@ApiTags('Leave Management')
@ApiBearerAuth()
@Controller('leave')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post('types')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Create leave type' })
  createLeaveType(
    @CompanyId() companyId: string,
    @Body() dto: CreateLeaveTypeDto,
  ) {
    return this.leaveService.createLeaveType(companyId, dto);
  }

  @Get('types')
  @ApiOperation({ summary: 'List leave types' })
  findLeaveTypes(@CompanyId() companyId: string) {
    return this.leaveService.findLeaveTypes(companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Submit a leave request' })
  create(@CompanyId() companyId: string, @Body() dto: CreateLeaveDto) {
    return this.leaveService.create(companyId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List leave requests' })
  findAll(@CompanyId() companyId: string, @Query() query: QueryLeaveDto) {
    return this.leaveService.findAll(companyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get leave request by ID' })
  findOne(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.leaveService.findOne(companyId, id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.HR, Role.SUPERVISOR)
  @ApiOperation({ summary: 'Approve, reject, or update leave request' })
  update(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateLeaveDto,
  ) {
    return this.leaveService.update(companyId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete leave request' })
  remove(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.leaveService.remove(companyId, id);
  }
}
