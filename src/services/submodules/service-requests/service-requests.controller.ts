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
import { ServiceStatus } from '@prisma/client';
import { CompanyId } from '../../../common/decorators/company-id.decorator';
import { CreateServiceRequestDto } from '../../dto/create-service-request.dto';
import { QueryServiceDto } from '../../dto/query-service.dto';
import { ServiceRequestsService } from './service-requests.service';

@ApiTags('Services - Requests')
@ApiBearerAuth()
@Controller('services/requests')
export class ServiceRequestsController {
  constructor(
    private readonly serviceRequestsService: ServiceRequestsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a service request' })
  create(
    @CompanyId() companyId: string,
    @Body() dto: CreateServiceRequestDto,
  ) {
    return this.serviceRequestsService.create(companyId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List service requests' })
  findAll(@CompanyId() companyId: string, @Query() query: QueryServiceDto) {
    return this.serviceRequestsService.findAll(companyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service request by ID' })
  findOne(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.serviceRequestsService.findOne(companyId, id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update service request status' })
  updateStatus(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body('status') status: ServiceStatus,
  ) {
    return this.serviceRequestsService.updateStatus(companyId, id, status);
  }
}
