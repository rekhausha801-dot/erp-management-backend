import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ServiceStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { generateCode } from '../../../common/utils/code-generator.util';
import {
  buildPaginatedResponse,
  buildPaginationQuery,
} from '../../../common/utils/pagination.util';
import { CreateServiceRequestDto } from '../../dto/create-service-request.dto';
import { QueryServiceDto } from '../../dto/query-service.dto';

@Injectable()
export class ServiceRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateServiceRequestDto) {
    let slaDueDate: Date | undefined;
    if (dto.slaId) {
      const sla = await this.prisma.sLA.findFirst({
        where: { id: dto.slaId, companyId },
      });
      if (!sla) {
        throw new NotFoundException('SLA not found in this company');
      }
      slaDueDate = new Date(Date.now() + sla.resolutionTime * 60 * 1000);
    }

    return this.prisma.serviceRequest.create({
      data: {
        companyId,
        customerId: dto.customerId,
        serviceCategoryId: dto.serviceCategoryId,
        requestNumber: generateCode('SREQ'),
        requestDate: new Date(dto.requestDate),
        requiredDate: dto.requiredDate ? new Date(dto.requiredDate) : undefined,
        status: dto.status ?? ServiceStatus.OPEN,
        priority: dto.priority,
        description: dto.description,
        location: dto.location,
        slaId: dto.slaId,
        slaDueDate,
        notes: dto.notes,
      },
      include: { customer: true, serviceCategory: true, sla: true },
    });
  }

  async findAll(companyId: string, query: QueryServiceDto) {
    const { skip, take, page, limit, orderBy } = buildPaginationQuery(query);
    const where: Prisma.ServiceRequestWhereInput = {
      companyId,
      ...(query.customerId ? { customerId: query.customerId } : {}),
      ...(query.serviceCategoryId
        ? { serviceCategoryId: query.serviceCategoryId }
        : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.priority ? { priority: query.priority } : {}),
      ...(query.search
        ? {
            OR: [
              { requestNumber: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.serviceRequest.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          customer: true,
          serviceCategory: true,
          sla: true,
          serviceAssignments: { include: { employee: true } },
        },
      }),
      this.prisma.serviceRequest.count({ where }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }

  async findOne(companyId: string, id: string) {
    const request = await this.prisma.serviceRequest.findFirst({
      where: { id, companyId },
      include: {
        customer: true,
        serviceCategory: true,
        sla: true,
        serviceAssignments: { include: { employee: true } },
        workOrders: true,
        serviceCompletions: true,
      },
    });
    if (!request) {
      throw new NotFoundException('Service request not found');
    }
    return request;
  }

  async updateStatus(companyId: string, id: string, status: ServiceStatus) {
    await this.findOne(companyId, id);
    return this.prisma.serviceRequest.update({
      where: { id },
      data: {
        status,
        closedAt: status === ServiceStatus.COMPLETED ? new Date() : undefined,
      },
    });
  }
}
