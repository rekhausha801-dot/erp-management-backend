import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, SalesStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { generateCode } from '../../../common/utils/code-generator.util';
import {
  buildPaginatedResponse,
  buildPaginationQuery,
} from '../../../common/utils/pagination.util';
import { computeLineItems } from '../../../common/utils/pricing.util';
import { CreateQuotationDto } from '../../dto/create-quotation.dto';
import { QuerySalesDto } from '../../dto/query-sales.dto';

@Injectable()
export class QuotationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateQuotationDto) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, companyId },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found in this company');
    }

    const { lineItems, subtotal, taxAmount, discount, total } =
      computeLineItems(dto.items);

    return this.prisma.quotation.create({
      data: {
        companyId,
        customerId: dto.customerId,
        quotationNumber: generateCode('QT'),
        quotationDate: new Date(dto.quotationDate),
        validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
        terms: dto.terms,
        notes: dto.notes,
        subtotal,
        taxAmount,
        discount,
        total,
        items: { create: lineItems },
      },
      include: { customer: true, items: true },
    });
  }

  async findAll(companyId: string, query: QuerySalesDto) {
    const { skip, take, page, limit, orderBy } = buildPaginationQuery(query);
    const where: Prisma.QuotationWhereInput = {
      companyId,
      ...(query.customerId ? { customerId: query.customerId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { quotationNumber: { contains: query.search, mode: 'insensitive' } },
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
      this.prisma.quotation.findMany({
        where,
        skip,
        take,
        orderBy,
        include: { customer: true, items: true },
      }),
      this.prisma.quotation.count({ where }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }

  async findOne(companyId: string, id: string) {
    const quotation = await this.prisma.quotation.findFirst({
      where: { id, companyId },
      include: { customer: true, items: true },
    });
    if (!quotation) {
      throw new NotFoundException('Quotation not found');
    }
    return quotation;
  }

  async updateStatus(companyId: string, id: string, status: SalesStatus) {
    await this.findOne(companyId, id);
    return this.prisma.quotation.update({
      where: { id },
      data: { status },
      include: { customer: true, items: true },
    });
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);
    return this.prisma.quotation.delete({ where: { id } });
  }
}
