import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CompanyId } from '../common/decorators/company-id.decorator';
import { ServicesService } from './services.service';

@ApiTags('Service Management')
@ApiBearerAuth()
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get Service Management Dashboard metrics' })
  getDashboard(@CompanyId() companyId: string) {
    return this.servicesService.getDashboard(companyId);
  }
}
