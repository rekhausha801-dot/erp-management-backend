import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CompanyId } from '../../../common/decorators/company-id.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/enums/role.enum';
import {
  CreateServiceAssignmentDto,
  ServiceAssignmentsService,
} from './service-assignments.service';

@ApiTags('Services - Assignments')
@ApiBearerAuth()
@Controller('services/assignments')
export class ServiceAssignmentsController {
  constructor(
    private readonly serviceAssignmentsService: ServiceAssignmentsService,
  ) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SUPERVISOR)
  @ApiOperation({ summary: 'Assign employee to a service request' })
  assign(
    @CompanyId() companyId: string,
    @Body() dto: CreateServiceAssignmentDto,
  ) {
    return this.serviceAssignmentsService.assign(companyId, dto);
  }

  @Get('request/:serviceRequestId')
  @ApiOperation({ summary: 'List assignments for a service request' })
  findByRequest(
    @CompanyId() companyId: string,
    @Param('serviceRequestId') serviceRequestId: string,
  ) {
    return this.serviceAssignmentsService.findByRequest(
      companyId,
      serviceRequestId,
    );
  }

  @Patch(':id/accept')
  @ApiOperation({ summary: 'Employee accepts assigned service work' })
  acceptAssignment(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.serviceAssignmentsService.acceptAssignment(companyId, id);
  }
}
