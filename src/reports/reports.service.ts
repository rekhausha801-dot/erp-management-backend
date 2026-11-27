import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getExecutiveOverview(companyId: string) {
    const [
      employeesCount,
      customersCount,
      salesTotal,
      serviceRequestsCount,
      inventoryItemsCount,
      expensesTotal,
    ] = await Promise.all([
      this.prisma.employee.count({ where: { companyId, isActive: true } }),
      this.prisma.customer.count({ where: { companyId, isActive: true } }),
      this.prisma.salesInvoice.aggregate({
        where: { companyId },
        _sum: { total: true },
      }),
      this.prisma.serviceRequest.count({ where: { companyId } }),
      this.prisma.inventoryItem.count({ where: { companyId, isActive: true } }),
      this.prisma.expense.aggregate({
        where: { companyId },
        _sum: { total: true },
      }),
    ]);

    return {
      employeesCount,
      customersCount,
      salesRevenue: Number(salesTotal._sum.total ?? 0),
      serviceRequestsCount,
      inventoryItemsCount,
      totalExpenses: Number(expensesTotal._sum.total ?? 0),
    };
  }
}
