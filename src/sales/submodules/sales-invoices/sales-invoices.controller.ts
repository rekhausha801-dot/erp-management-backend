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
import { InvoiceStatus } from '@prisma/client';
import { CompanyId } from '../../../common/decorators/company-id.decorator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import {
  CreateSalesInvoiceDto,
  SalesInvoicesService,
} from './sales-invoices.service';

@ApiTags('Sales - Invoices')
@ApiBearerAuth()
@Controller('sales/invoices')
export class SalesInvoicesController {
  constructor(private readonly salesInvoicesService: SalesInvoicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a sales invoice' })
  create(@CompanyId() companyId: string, @Body() dto: CreateSalesInvoiceDto) {
    return this.salesInvoicesService.create(companyId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List sales invoices' })
  findAll(@CompanyId() companyId: string, @Query() query: PaginationDto) {
    return this.salesInvoicesService.findAll(companyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sales invoice by ID' })
  findOne(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.salesInvoicesService.findOne(companyId, id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update sales invoice status' })
  updateStatus(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body('status') status: InvoiceStatus,
  ) {
    return this.salesInvoicesService.updateStatus(companyId, id, status);
  }
}
