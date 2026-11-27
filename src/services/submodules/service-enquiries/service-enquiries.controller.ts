import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CompanyId } from '../../../common/decorators/company-id.decorator';
import { QueryServiceDto } from '../../dto/query-service.dto';
import {
  CreateServiceEnquiryDto,
  ServiceEnquiriesService,
} from './service-enquiries.service';

@ApiTags('Services - Enquiries')
@ApiBearerAuth()
@Controller('services/enquiries')
export class ServiceEnquiriesController {
  constructor(
    private readonly serviceEnquiriesService: ServiceEnquiriesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a service enquiry' })
  create(@CompanyId() companyId: string, @Body() dto: CreateServiceEnquiryDto) {
    return this.serviceEnquiriesService.create(companyId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List service enquiries' })
  findAll(@CompanyId() companyId: string, @Query() query: QueryServiceDto) {
    return this.serviceEnquiriesService.findAll(companyId, query);
  }

  @Post(':id/convert')
  @ApiOperation({ summary: 'Convert service enquiry to a service request' })
  convertToRequest(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.serviceEnquiriesService.convertToRequest(companyId, id);
  }
}
