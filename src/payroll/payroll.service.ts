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
import { CreatePayrollDto } from './dto/create-payroll.dto';
import { QueryPayrollDto } from './dto/query-payroll.dto';
import { UpdatePayrollDto } from './dto/update-payroll.dto';

@Injectable()
export class PayrollService {
  constructor(private readonly prisma: PrismaService) {}

  async generatePayroll(companyId: string, dto: CreatePayrollDto, userId: string) {
    const existing = await this.prisma.payroll.findUnique({
      where: {
        companyId_month_year: {
          companyId,
          month: dto.month,
          year: dto.year,
        },
      },
    });
    if (existing) {
      throw new ConflictException(
        `Payroll already exists for ${dto.month}/${dto.year}`,
      );
    }

    const employees = await this.prisma.employee.findMany({
      where: { companyId, isActive: true },
    });

    return this.prisma.$transaction(async (tx) => {
      const payroll = await tx.payroll.create({
        data: {
          companyId,
          month: dto.month,
          year: dto.year,
          status: 'PROCESSED',
          processedAt: new Date(),
          processedBy: userId,
          notes: dto.notes,
        },
      });

      for (const emp of employees) {
        const basicSalary = Number(emp.basicSalary);
        await tx.payslip.create({
          data: {
            companyId,
            payrollId: payroll.id,
            employeeId: emp.id,
            month: dto.month,
            year: dto.year,
            basicSalary,
            grossSalary: basicSalary,
            totalDeductions: 0,
            netSalary: basicSalary,
            workingDays: 30,
            presentDays: 30,
            status: 'GENERATED',
          },
        });
      }

      return tx.payroll.findUnique({
        where: { id: payroll.id },
        include: { payslips: { include: { employee: true } } },
      });
    });
  }

  async findAll(companyId: string, query: QueryPayrollDto) {
    const { skip, take, page, limit, orderBy } = buildPaginationQuery(query);
    const where: Prisma.PayrollWhereInput = {
      companyId,
      ...(query.year ? { year: query.year } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.payroll.findMany({
        where,
        skip,
        take,
        orderBy,
        include: { _count: { select: { payslips: true } } },
      }),
      this.prisma.payroll.count({ where }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }

  async findOne(companyId: string, id: string) {
    const payroll = await this.prisma.payroll.findFirst({
      where: { id, companyId },
      include: { payslips: { include: { employee: true, items: true } } },
    });
    if (!payroll) {
      throw new NotFoundException('Payroll not found');
    }
    return payroll;
  }

  async update(companyId: string, id: string, dto: UpdatePayrollDto) {
    await this.findOne(companyId, id);
    return this.prisma.payroll.update({
      where: { id },
      data: { status: dto.status, notes: dto.notes },
    });
  }
}
