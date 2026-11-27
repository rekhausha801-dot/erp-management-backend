import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceStatus } from '@prisma/client';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../../../prisma/prisma.service';

export class CreateServiceAssignmentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  serviceRequestId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

@Injectable()
export class ServiceAssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async assign(companyId: string, dto: CreateServiceAssignmentDto) {
    const [request, employee] = await Promise.all([
      this.prisma.serviceRequest.findFirst({
        where: { id: dto.serviceRequestId, companyId },
      }),
      this.prisma.employee.findFirst({
        where: { id: dto.employeeId, companyId },
      }),
    ]);

    if (!request) {
      throw new NotFoundException('Service request not found');
    }
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const assignment = await tx.serviceAssignment.create({
        data: {
          companyId,
          serviceRequestId: dto.serviceRequestId,
          employeeId: dto.employeeId,
          notes: dto.notes,
        },
        include: { employee: true, serviceRequest: true },
      });

      await tx.serviceRequest.update({
        where: { id: dto.serviceRequestId },
        data: { status: ServiceStatus.ASSIGNED },
      });

      return assignment;
    });
  }

  async findByRequest(companyId: string, serviceRequestId: string) {
    return this.prisma.serviceAssignment.findMany({
      where: { companyId, serviceRequestId },
      include: { employee: true },
      orderBy: { assignedAt: 'desc' },
    });
  }

  async acceptAssignment(companyId: string, id: string) {
    const assignment = await this.prisma.serviceAssignment.findFirst({
      where: { id, companyId },
    });
    if (!assignment) {
      throw new NotFoundException('Service assignment not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.serviceAssignment.update({
        where: { id },
        data: { status: ServiceStatus.IN_PROGRESS },
      });
      await tx.serviceRequest.update({
        where: { id: assignment.serviceRequestId },
        data: { status: ServiceStatus.IN_PROGRESS },
      });
      return updated;
    });
  }
}
