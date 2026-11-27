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
import { CompanyId } from '../common/decorators/company-id.decorator';
import {
  CreatePurchaseInvoiceDto,
  CreatePurchaseOrderDto,
} from './dto/create-purchase.dto';
import { QueryPurchaseDto } from './dto/query-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { PurchasesService } from './purchases.service';

@ApiTags('Purchases')
@ApiBearerAuth()
@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Post('orders')
  @ApiOperation({ summary: 'Create purchase order' })
  createOrder(
    @CompanyId() companyId: string,
    @Body() dto: CreatePurchaseOrderDto,
  ) {
    return this.purchasesService.createOrder(companyId, dto);
  }

  @Get('orders')
  @ApiOperation({ summary: 'List purchase orders' })
  findOrders(
    @CompanyId() companyId: string,
    @Query() query: QueryPurchaseDto,
  ) {
    return this.purchasesService.findOrders(companyId, query);
  }

  @Patch('orders/:id')
  @ApiOperation({ summary: 'Update purchase order' })
  updateOrder(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePurchaseDto,
  ) {
    return this.purchasesService.updateOrder(companyId, id, dto);
  }

  @Post('invoices')
  @ApiOperation({ summary: 'Create purchase invoice' })
  createInvoice(
    @CompanyId() companyId: string,
    @Body() dto: CreatePurchaseInvoiceDto,
  ) {
    return this.purchasesService.createInvoice(companyId, dto);
  }

  @Get('invoices')
  @ApiOperation({ summary: 'List purchase invoices' })
  findInvoices(
    @CompanyId() companyId: string,
    @Query() query: QueryPurchaseDto,
  ) {
    return this.purchasesService.findInvoices(companyId, query);
  }
}
