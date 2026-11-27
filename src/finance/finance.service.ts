import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  buildPaginatedResponse,
  buildPaginationQuery,
} from '../common/utils/pagination.util';
import { CreateAccountDto } from './dto/create-finance.dto';
import { QueryFinanceDto } from './dto/query-finance.dto';
import { UpdateFinanceDto } from './dto/update-finance.dto';

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  async createAccount(companyId: string, dto: CreateAccountDto) {
    const existing = await this.prisma.account.findUnique({
      where: { companyId_code: { companyId, code: dto.code } },
    });
    if (existing) {
      throw new ConflictException('Account code already exists');
    }
    return this.prisma.account.create({
      data: { companyId, ...dto },
    });
  }

  async findAllAccounts(companyId: string, query: QueryFinanceDto) {
    const { skip, take, page, limit, orderBy } = buildPaginationQuery(query);
    const where: Prisma.AccountWhereInput = {
      companyId,
      ...(query.type ? { type: query.type } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { code: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.account.findMany({ where, skip, take, orderBy }),
      this.prisma.account.count({ where }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }

  async findOneAccount(companyId: string, id: string) {
    const account = await this.prisma.account.findFirst({
      where: { id, companyId },
      include: { children: true },
    });
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return account;
  }

  async updateAccount(companyId: string, id: string, dto: UpdateFinanceDto) {
    await this.findOneAccount(companyId, id);
    return this.prisma.account.update({ where: { id }, data: dto });
  }

  async getSummary(companyId: string) {
    const [accountsCount, salesInvAgg, expAgg, payAgg] = await Promise.all([
      this.prisma.account.count({ where: { companyId } }),
      this.prisma.salesInvoice.aggregate({
        where: { companyId },
        _sum: { total: true },
      }),
      this.prisma.expense.aggregate({
        where: { companyId },
        _sum: { total: true },
      }),
      this.prisma.payment.aggregate({
        where: { companyId, status: 'COMPLETED' },
        _sum: { amount: true },
      }),
    ]);

    return {
      accountsCount,
      totalSalesRevenue: Number(salesInvAgg._sum.total ?? 0),
      totalExpenses: Number(expAgg._sum.total ?? 0),
      totalPaymentsReceived: Number(payAgg._sum.amount ?? 0),
    };
  }
}
