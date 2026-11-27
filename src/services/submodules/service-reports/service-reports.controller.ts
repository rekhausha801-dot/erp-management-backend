import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CompanyId } from '../../../common/decorators/company-id.decorator';
import { ServiceReportsService } from './service-reports.service';

@ApiTags('Services - Reports')
@ApiBearerAuth()
@Controller('services/reports')
export class ServiceReportsController {
  constructor(private readonly serviceReportsService: ServiceReportsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get service management reports summary' })
  getSummary(@CompanyId() companyId: string) {
    return this.serviceReportsService.getSummary(companyId);
  }
}
