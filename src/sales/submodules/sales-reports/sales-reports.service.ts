import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class SalesReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(companyId: string) {
    const [salesByStatus, invoicesByStatus, returnsAgg] = await Promise.all([
      this.prisma.sales.groupBy({
        by: ['status'],
        where: { companyId },
        _count: { id: true },
        _sum: { total: true },
      }),
      this.prisma.salesInvoice.groupBy({
        by: ['status'],
        where: { companyId },
        _count: { id: true },
        _sum: { total: true, paidAmount: true, balanceDue: true },
      }),
      this.prisma.salesReturn.aggregate({
        where: { companyId },
        _count: { id: true },
        _sum: { total: true },
      }),
    ]);

    return {
      salesByStatus,
      invoicesByStatus,
      returns: {
        count: returnsAgg._count.id,
        totalAmount: Number(returnsAgg._sum.total ?? 0),
      },
    };
  }
}
