import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ServiceDashboardSummary } from './interfaces/services.interface';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(companyId: string): Promise<ServiceDashboardSummary> {
    const [
      categoriesCount,
      enquiriesCount,
      openRequestsCount,
      inProgressRequestsCount,
      completedRequestsCount,
      workOrdersCount,
      pendingWorkOrdersCount,
    ] = await Promise.all([
      this.prisma.serviceCategory.count({ where: { companyId } }),
      this.prisma.serviceEnquiry.count({ where: { companyId } }),
      this.prisma.serviceRequest.count({
        where: { companyId, status: 'OPEN' },
      }),
      this.prisma.serviceRequest.count({
        where: { companyId, status: { in: ['ASSIGNED', 'IN_PROGRESS'] } },
      }),
      this.prisma.serviceRequest.count({
        where: { companyId, status: 'COMPLETED' },
      }),
      this.prisma.workOrder.count({ where: { companyId } }),
      this.prisma.workOrder.count({
        where: { companyId, status: { in: ['PENDING', 'IN_PROGRESS'] } },
      }),
    ]);

    return {
      categoriesCount,
      enquiriesCount,
      openRequestsCount,
      inProgressRequestsCount,
      completedRequestsCount,
      workOrdersCount,
      pendingWorkOrdersCount,
    };
  }
}
