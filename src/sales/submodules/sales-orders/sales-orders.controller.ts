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
import { OrderStatus } from '@prisma/client';
import { CompanyId } from '../../../common/decorators/company-id.decorator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import {
  CreateSalesOrderDto,
  SalesOrdersService,
} from './sales-orders.service';

@ApiTags('Sales - Orders')
@ApiBearerAuth()
@Controller('sales/orders')
export class SalesOrdersController {
  constructor(private readonly salesOrdersService: SalesOrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a sales order' })
  create(@CompanyId() companyId: string, @Body() dto: CreateSalesOrderDto) {
    return this.salesOrdersService.create(companyId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List sales orders' })
  findAll(@CompanyId() companyId: string, @Query() query: PaginationDto) {
    return this.salesOrdersService.findAll(companyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sales order by ID' })
  findOne(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.salesOrdersService.findOne(companyId, id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update sales order status' })
  updateStatus(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
  ) {
    return this.salesOrdersService.updateStatus(companyId, id, status);
  }
}
