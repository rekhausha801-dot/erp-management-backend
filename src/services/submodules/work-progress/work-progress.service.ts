import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateWorkProgressDto } from '../../dto/update-work-progress.dto';

@Injectable()
export class WorkProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateWorkProgressDto) {
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id: dto.workOrderId, companyId },
    });
    if (!workOrder) {
      throw new NotFoundException('Work order not found in this company');
    }

    return this.prisma.workProgress.create({
      data: {
        workOrderId: dto.workOrderId,
        employeeId: dto.employeeId,
        date: new Date(dto.date),
        hoursWorked: dto.hoursWorked,
        description: dto.description,
        materials: dto.materials,
      },
      include: { employee: true, workOrder: true },
    });
  }

  async findByWorkOrder(companyId: string, workOrderId: string) {
    const workOrder = await this.prisma.workOrder.findFirst({
      where: { id: workOrderId, companyId },
    });
    if (!workOrder) {
      throw new NotFoundException('Work order not found in this company');
    }

    return this.prisma.workProgress.findMany({
      where: { workOrderId },
      include: { employee: true },
      orderBy: { date: 'desc' },
    });
  }
}
