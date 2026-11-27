import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { generateCode } from '../common/utils/code-generator.util';
import {
  buildPaginatedResponse,
  buildPaginationQuery,
} from '../common/utils/pagination.util';
import { computeLineItems } from '../common/utils/pricing.util';
import {
  CreatePurchaseInvoiceDto,
  CreatePurchaseOrderDto,
} from './dto/create-purchase.dto';
import { QueryPurchaseDto } from './dto/query-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';

@Injectable()
export class PurchasesService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(companyId: string, dto: CreatePurchaseOrderDto) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id: dto.supplierId, companyId },
    });
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    const { lineItems, subtotal, taxAmount, discount, total } =
      computeLineItems(dto.items);

    return this.prisma.purchaseOrder.create({
      data: {
        companyId,
        supplierId: dto.supplierId,
        orderNumber: generateCode('PO'),
        orderDate: new Date(dto.orderDate),
        deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : undefined,
        terms: dto.terms,
        notes: dto.notes,
        subtotal,
        taxAmount,
        discount,
        total,
        items: { create: lineItems },
      },
      include: { supplier: true, items: true },
    });
  }

  async findOrders(companyId: string, query: QueryPurchaseDto) {
    const { skip, take, page, limit, orderBy } = buildPaginationQuery(query);
    const where: Prisma.PurchaseOrderWhereInput = {
      companyId,
      ...(query.supplierId ? { supplierId: query.supplierId } : {}),
      ...(query.search
        ? { orderNumber: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        where,
        skip,
        take,
        orderBy,
        include: { supplier: true, items: true },
      }),
      this.prisma.purchaseOrder.count({ where }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }

  async updateOrder(companyId: string, id: string, dto: UpdatePurchaseDto) {
    const order = await this.prisma.purchaseOrder.findFirst({
      where: { id, companyId },
    });
    if (!order) {
      throw new NotFoundException('Purchase order not found');
    }
    return this.prisma.purchaseOrder.update({
      where: { id },
      data: dto,
      include: { supplier: true, items: true },
    });
  }

  async createInvoice(companyId: string, dto: CreatePurchaseInvoiceDto) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id: dto.supplierId, companyId },
    });
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    const { lineItems, subtotal, taxAmount, discount, total } =
      computeLineItems(dto.items);

    return this.prisma.purchaseInvoice.create({
      data: {
        companyId,
        supplierId: dto.supplierId,
        purchaseOrderId: dto.purchaseOrderId,
        invoiceNumber: generateCode('PINV'),
        invoiceDate: new Date(dto.invoiceDate),
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        notes: dto.notes,
        subtotal,
        taxAmount,
        discount,
        total,
        balanceDue: total,
        items: { create: lineItems },
      },
      include: { supplier: true, items: true },
    });
  }

  async findInvoices(companyId: string, query: QueryPurchaseDto) {
    const { skip, take, page, limit, orderBy } = buildPaginationQuery(query);
    const where: Prisma.PurchaseInvoiceWhereInput = {
      companyId,
      ...(query.supplierId ? { supplierId: query.supplierId } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.purchaseInvoice.findMany({
        where,
        skip,
        take,
        orderBy,
        include: { supplier: true, items: true },
      }),
      this.prisma.purchaseInvoice.count({ where }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }
}
