import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CompanyId } from '../../../common/decorators/company-id.decorator';
import { SalesReportsService } from './sales-reports.service';

@ApiTags('Sales - Reports')
@ApiBearerAuth()
@Controller('sales/reports')
export class SalesReportsController {
  constructor(private readonly salesReportsService: SalesReportsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get sales reports summary' })
  getSummary(@CompanyId() companyId: string) {
    return this.salesReportsService.getSummary(companyId);
  }
}
