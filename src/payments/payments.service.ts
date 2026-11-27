import { Injectable, NotFoundException } from '@nestjs/common';
import { InvoiceStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { generateCode } from '../common/utils/code-generator.util';
import {
  buildPaginatedResponse,
  buildPaginationQuery,
} from '../common/utils/pagination.util';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { QueryPaymentDto } from './dto/query-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreatePaymentDto) {
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          companyId,
          customerId: dto.customerId,
          invoiceId: dto.invoiceId,
          salesInvoiceId: dto.salesInvoiceId,
          purchaseInvoiceId: dto.purchaseInvoiceId,
          accountId: dto.accountId,
          paymentNumber: generateCode('PAY'),
          paymentDate: new Date(dto.paymentDate),
          amount: dto.amount,
          method: dto.method,
          status: dto.status,
          reference: dto.reference,
          notes: dto.notes,
        },
      });

      if (dto.salesInvoiceId) {
        const inv = await tx.salesInvoice.findFirst({
          where: { id: dto.salesInvoiceId, companyId },
        });
        if (inv) {
          const paid = Number(inv.paidAmount) + dto.amount;
          const balance = Math.max(0, Number(inv.total) - paid);
          await tx.salesInvoice.update({
            where: { id: inv.id },
            data: {
              paidAmount: paid,
              balanceDue: balance,
              status: balance === 0 ? InvoiceStatus.PAID : inv.status,
            },
          });
        }
      }

      if (dto.invoiceId) {
        const inv = await tx.invoice.findFirst({
          where: { id: dto.invoiceId, companyId },
        });
        if (inv) {
          const paid = Number(inv.paidAmount) + dto.amount;
          const balance = Math.max(0, Number(inv.total) - paid);
          await tx.invoice.update({
            where: { id: inv.id },
            data: {
              paidAmount: paid,
              balanceDue: balance,
              status: balance === 0 ? InvoiceStatus.PAID : inv.status,
            },
          });
        }
      }

      return payment;
    });
  }

  async findAll(companyId: string, query: QueryPaymentDto) {
    const { skip, take, page, limit, orderBy } = buildPaginationQuery(query);
    const where: Prisma.PaymentWhereInput = {
      companyId,
      ...(query.customerId ? { customerId: query.customerId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? { paymentNumber: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take,
        orderBy,
        include: { customer: true, invoice: true, salesInvoice: true },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }

  async findOne(companyId: string, id: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id, companyId },
      include: { customer: true, invoice: true, salesInvoice: true },
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }
}
