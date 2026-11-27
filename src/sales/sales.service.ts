import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { generateCode } from '../common/utils/code-generator.util';
import {
  buildPaginatedResponse,
  buildPaginationQuery,
} from '../common/utils/pagination.util';
import { CreateLeadDto, CreateSalesDto } from './dto/create-sales.dto';
import { QuerySalesDto } from './dto/query-sales.dto';
import { UpdateLeadDto, UpdateSalesDto } from './dto/update-sales.dto';
import { SalesDashboardSummary } from './interfaces/sales.interface';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(companyId: string): Promise<SalesDashboardSummary> {
    const [
      salesAgg,
      quotationsCount,
      ordersCount,
      invoicesCount,
      pendingInvoicesAgg,
      leadsCount,
    ] = await Promise.all([
      this.prisma.sales.aggregate({
        where: { companyId },
        _count: { id: true },
        _sum: { total: true },
      }),
      this.prisma.quotation.count({ where: { companyId } }),
      this.prisma.salesOrder.count({ where: { companyId } }),
      this.prisma.salesInvoice.count({ where: { companyId } }),
      this.prisma.salesInvoice.aggregate({
        where: { companyId, status: { in: ['DRAFT', 'SENT', 'OVERDUE'] } },
        _sum: { balanceDue: true },
      }),
      this.prisma.lead.count({ where: { companyId } }),
    ]);

    return {
      totalSalesCount: salesAgg._count.id,
      totalSalesAmount: Number(salesAgg._sum.total ?? 0),
      quotationsCount,
      ordersCount,
      invoicesCount,
      pendingInvoicesAmount: Number(pendingInvoicesAgg._sum.balanceDue ?? 0),
      leadsCount,
    };
  }

  async create(companyId: string, dto: CreateSalesDto) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, companyId },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found in this company');
    }

    const taxAmount = dto.taxAmount ?? 0;
    const discount = dto.discount ?? 0;
    const total = dto.subtotal + taxAmount - discount;

    return this.prisma.sales.create({
      data: {
        companyId,
        customerId: dto.customerId,
        saleNumber: dto.saleNumber ?? generateCode('SAL'),
        saleDate: new Date(dto.saleDate),
        status: dto.status,
        subtotal: dto.subtotal,
        taxAmount,
        discount,
        total,
        notes: dto.notes,
      },
      include: { customer: true },
    });
  }

  async findAll(companyId: string, query: QuerySalesDto) {
    const { skip, take, page, limit, orderBy } = buildPaginationQuery(query);
    const where: Prisma.SalesWhereInput = {
      companyId,
      ...(query.customerId ? { customerId: query.customerId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.fromDate || query.toDate
        ? {
            saleDate: {
              ...(query.fromDate ? { gte: new Date(query.fromDate) } : {}),
              ...(query.toDate ? { lte: new Date(query.toDate) } : {}),
            },
          }
        : {}),
      ...(query.search
        ? {
            OR: [
              { saleNumber: { contains: query.search, mode: 'insensitive' } },
              {
                customer: {
                  name: { contains: query.search, mode: 'insensitive' },
                },
              },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.sales.findMany({
        where,
        skip,
        take,
        orderBy,
        include: { customer: true },
      }),
      this.prisma.sales.count({ where }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }

  async findOne(companyId: string, id: string) {
    const sale = await this.prisma.sales.findFirst({
      where: { id, companyId },
      include: { customer: true },
    });
    if (!sale) {
      throw new NotFoundException('Sale record not found');
    }
    return sale;
  }

  async update(companyId: string, id: string, dto: UpdateSalesDto) {
    const existing = await this.findOne(companyId, id);
    const subtotal = dto.subtotal ?? Number(existing.subtotal);
    const taxAmount = dto.taxAmount ?? Number(existing.taxAmount);
    const discount = dto.discount ?? Number(existing.discount);
    const total = subtotal + taxAmount - discount;

    return this.prisma.sales.update({
      where: { id },
      data: {
        customerId: dto.customerId,
        saleDate: dto.saleDate ? new Date(dto.saleDate) : undefined,
        status: dto.status,
        subtotal,
        taxAmount,
        discount,
        total,
        notes: dto.notes,
      },
      include: { customer: true },
    });
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);
    return this.prisma.sales.delete({ where: { id } });
  }

  // Lead Management (Sales CRM)
  async createLead(companyId: string, dto: CreateLeadDto) {
    return this.prisma.lead.create({
      data: {
        companyId,
        customerId: dto.customerId,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        source: dto.source,
        status: dto.status ?? 'NEW',
        priority: dto.priority,
        value: dto.value,
        notes: dto.notes,
        assignedTo: dto.assignedTo,
        followUpDate: dto.followUpDate ? new Date(dto.followUpDate) : undefined,
      },
    });
  }

  async findLeads(companyId: string, query: QuerySalesDto) {
    const { skip, take, page, limit, orderBy } = buildPaginationQuery(query);
    const where: Prisma.LeadWhereInput = {
      companyId,
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.lead.findMany({ where, skip, take, orderBy }),
      this.prisma.lead.count({ where }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }

  async updateLead(companyId: string, id: string, dto: UpdateLeadDto) {
    const lead = await this.prisma.lead.findFirst({ where: { id, companyId } });
    if (!lead) {
      throw new NotFoundException('Lead not found');
    }
    return this.prisma.lead.update({
      where: { id },
      data: {
        ...dto,
        followUpDate: dto.followUpDate ? new Date(dto.followUpDate) : undefined,
      },
    });
  }
}
