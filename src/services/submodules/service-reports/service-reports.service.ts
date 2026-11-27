import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ServiceReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(companyId: string) {
    const [requestsByStatus, workOrdersByStatus, avgRating] = await Promise.all([
      this.prisma.serviceRequest.groupBy({
        by: ['status'],
        where: { companyId },
        _count: { id: true },
      }),
      this.prisma.workOrder.groupBy({
        by: ['status'],
        where: { companyId },
        _count: { id: true },
        _sum: { totalCost: true },
      }),
      this.prisma.serviceCompletion.aggregate({
        where: { serviceRequest: { companyId } },
        _avg: { rating: true },
        _count: { id: true },
      }),
    ]);

    return {
      requestsByStatus,
      workOrdersByStatus,
      completions: {
        count: avgRating._count.id,
        averageRating: avgRating._avg.rating ?? 0,
      },
    };
  }
}
