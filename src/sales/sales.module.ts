import { Module } from '@nestjs/common';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { QuotationsController } from './submodules/quotations/quotations.controller';
import { QuotationsService } from './submodules/quotations/quotations.service';
import { SalesOrdersController } from './submodules/sales-orders/sales-orders.controller';
import { SalesOrdersService } from './submodules/sales-orders/sales-orders.service';
import { SalesInvoicesController } from './submodules/sales-invoices/sales-invoices.controller';
import { SalesInvoicesService } from './submodules/sales-invoices/sales-invoices.service';
import { SalesReturnsController } from './submodules/sales-returns/sales-returns.controller';
import { SalesReturnsService } from './submodules/sales-returns/sales-returns.service';
import { SalesReportsController } from './submodules/sales-reports/sales-reports.controller';
import { SalesReportsService } from './submodules/sales-reports/sales-reports.service';

@Module({
  controllers: [
    SalesController,
    QuotationsController,
    SalesOrdersController,
    SalesInvoicesController,
    SalesReturnsController,
    SalesReportsController,
  ],
  providers: [
    SalesService,
    QuotationsService,
    SalesOrdersService,
    SalesInvoicesService,
    SalesReturnsService,
    SalesReportsService,
  ],
  exports: [SalesService],
})
export class SalesModule {}
