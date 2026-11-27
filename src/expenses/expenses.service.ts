import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { generateCode } from '../common/utils/code-generator.util';
import {
  buildPaginatedResponse,
  buildPaginationQuery,
} from '../common/utils/pagination.util';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { QueryExpenseDto } from './dto/query-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateExpenseDto) {
    const taxAmount = dto.taxAmount ?? 0;
    const total = dto.amount + taxAmount;

    return this.prisma.expense.create({
      data: {
        companyId,
        accountId: dto.accountId,
        expenseNumber: generateCode('EXP'),
        expenseDate: new Date(dto.expenseDate),
        category: dto.category,
        description: dto.description,
        amount: dto.amount,
        taxAmount,
        total,
        paymentMethod: dto.paymentMethod,
        notes: dto.notes,
      },
    });
  }

  async findAll(companyId: string, query: QueryExpenseDto) {
    const { skip, take, page, limit, orderBy } = buildPaginationQuery(query);
    const where: Prisma.ExpenseWhereInput = {
      companyId,
      ...(query.category ? { category: query.category } : {}),
      ...(query.search
        ? {
            OR: [
              { expenseNumber: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.expense.findMany({ where, skip, take, orderBy }),
      this.prisma.expense.count({ where }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }

  async findOne(companyId: string, id: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, companyId },
    });
    if (!expense) {
      throw new NotFoundException('Expense not found');
    }
    return expense;
  }

  async update(companyId: string, id: string, dto: UpdateExpenseDto) {
    await this.findOne(companyId, id);
    return this.prisma.expense.update({
      where: { id },
      data: {
        status: dto.status,
        notes: dto.notes,
        approvedAt: dto.status === 'APPROVED' ? new Date() : undefined,
      },
    });
  }
}
