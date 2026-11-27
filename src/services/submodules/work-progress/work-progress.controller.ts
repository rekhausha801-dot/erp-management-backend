import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CompanyId } from '../../../common/decorators/company-id.decorator';
import { CreateWorkProgressDto } from '../../dto/update-work-progress.dto';
import { WorkProgressService } from './work-progress.service';

@ApiTags('Services - Work Progress')
@ApiBearerAuth()
@Controller('services/work-progress')
export class WorkProgressController {
  constructor(private readonly workProgressService: WorkProgressService) {}

  @Post()
  @ApiOperation({
    summary: 'Log work progress on a work order (separate from Attendance)',
  })
  create(@CompanyId() companyId: string, @Body() dto: CreateWorkProgressDto) {
    return this.workProgressService.create(companyId, dto);
  }

  @Get('work-order/:workOrderId')
  @ApiOperation({ summary: 'Get work progress entries for a work order' })
  findByWorkOrder(
    @CompanyId() companyId: string,
    @Param('workOrderId') workOrderId: string,
  ) {
    return this.workProgressService.findByWorkOrder(companyId, workOrderId);
  }
}
