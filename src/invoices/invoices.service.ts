import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { generateCode } from '../common/utils/code-generator.util';
import {
  buildPaginatedResponse,
  buildPaginationQuery,
} from '../common/utils/pagination.util';
import { computeLineItems } from '../common/utils/pricing.util';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { QueryInvoiceDto } from './dto/query-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateInvoiceDto) {
    const { lineItems, subtotal, taxAmount, discount, total } =
      computeLineItems(dto.items);

    return this.prisma.invoice.create({
      data: {
        companyId,
        customerId: dto.customerId,
        invoiceNumber: generateCode('INV'),
        invoiceDate: new Date(dto.invoiceDate),
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        notes: dto.notes,
        terms: dto.terms,
        subtotal,
        taxAmount,
        discount,
        total,
        balanceDue: total,
        items: {
          create: lineItems.map(({ itemId: _i, ...rest }) => rest),
        },
      },
      include: { customer: true, items: true },
    });
  }

  async findAll(companyId: string, query: QueryInvoiceDto) {
    const { skip, take, page, limit, orderBy } = buildPaginationQuery(query);
    const where: Prisma.InvoiceWhereInput = {
      companyId,
      ...(query.customerId ? { customerId: query.customerId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? { invoiceNumber: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip,
        take,
        orderBy,
        include: { customer: true, items: true },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }

  async findOne(companyId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, companyId },
      include: { customer: true, items: true, payments: true },
    });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    return invoice;
  }

  async update(companyId: string, id: string, dto: UpdateInvoiceDto) {
    await this.findOne(companyId, id);
    return this.prisma.invoice.update({
      where: { id },
      data: dto,
      include: { customer: true, items: true },
    });
  }
}
