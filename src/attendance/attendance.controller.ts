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
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@ApiTags('Attendance')
@ApiBearerAuth()
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @ApiOperation({ summary: 'Record employee attendance (separate from work progress)' })
  create(@CompanyId() companyId: string, @Body() dto: CreateAttendanceDto) {
    return this.attendanceService.create(companyId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List attendance records' })
  findAll(@CompanyId() companyId: string, @Query() query: QueryAttendanceDto) {
    return this.attendanceService.findAll(companyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get attendance record by ID' })
  findOne(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.attendanceService.findOne(companyId, id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.HR, Role.SUPERVISOR)
  @ApiOperation({ summary: 'Update attendance record' })
  update(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAttendanceDto,
  ) {
    return this.attendanceService.update(companyId, id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Delete attendance record' })
  remove(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.attendanceService.remove(companyId, id);
  }
}
