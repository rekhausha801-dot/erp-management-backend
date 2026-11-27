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
import { WorkOrderStatus } from '@prisma/client';
import { CompanyId } from '../../../common/decorators/company-id.decorator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { CreateWorkOrderDto, WorkOrdersService } from './work-orders.service';

@ApiTags('Services - Work Orders')
@ApiBearerAuth()
@Controller('services/work-orders')
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a work order' })
  create(@CompanyId() companyId: string, @Body() dto: CreateWorkOrderDto) {
    return this.workOrdersService.create(companyId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List work orders' })
  findAll(@CompanyId() companyId: string, @Query() query: PaginationDto) {
    return this.workOrdersService.findAll(companyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get work order by ID' })
  findOne(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.workOrdersService.findOne(companyId, id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update work order status' })
  updateStatus(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body('status') status: WorkOrderStatus,
  ) {
    return this.workOrdersService.updateStatus(companyId, id, status);
  }
}
