import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LeaveStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  buildPaginatedResponse,
  buildPaginationQuery,
} from '../common/utils/pagination.util';
import { CreateLeaveDto, CreateLeaveTypeDto } from './dto/create-leave.dto';
import { QueryLeaveDto } from './dto/query-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';

@Injectable()
export class LeaveService {
  constructor(private readonly prisma: PrismaService) {}

  async createLeaveType(companyId: string, dto: CreateLeaveTypeDto) {
    const existing = await this.prisma.leaveType.findUnique({
      where: { companyId_code: { companyId, code: dto.code } },
    });
    if (existing) {
      throw new ConflictException('Leave type code already exists');
    }
    return this.prisma.leaveType.create({
      data: { companyId, ...dto },
    });
  }

  async findLeaveTypes(companyId: string) {
    return this.prisma.leaveType.findMany({
      where: { companyId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async create(companyId: string, dto: CreateLeaveDto) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: dto.employeeId, companyId },
    });
    if (!employee) {
      throw new NotFoundException('Employee not found in this company');
    }

    return this.prisma.leave.create({
      data: {
        companyId,
        employeeId: dto.employeeId,
        leaveTypeId: dto.leaveTypeId,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        totalDays: dto.totalDays,
        reason: dto.reason,
        comments: dto.comments,
      },
      include: { employee: true, leaveType: true },
    });
  }

  async findAll(companyId: string, query: QueryLeaveDto) {
    const { skip, take, page, limit, orderBy } = buildPaginationQuery(query);
    const where: Prisma.LeaveWhereInput = {
      companyId,
      ...(query.employeeId ? { employeeId: query.employeeId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { reason: { contains: query.search, mode: 'insensitive' } },
              {
                employee: {
                  firstName: { contains: query.search, mode: 'insensitive' },
                },
              },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.leave.findMany({
        where,
        skip,
        take,
        orderBy,
        include: { employee: true, leaveType: true },
      }),
      this.prisma.leave.count({ where }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }

  async findOne(companyId: string, id: string) {
    const leave = await this.prisma.leave.findFirst({
      where: { id, companyId },
      include: { employee: true, leaveType: true, approver: true },
    });
    if (!leave) {
      throw new NotFoundException('Leave request not found');
    }
    return leave;
  }

  async update(companyId: string, id: string, dto: UpdateLeaveDto) {
    await this.findOne(companyId, id);
    return this.prisma.leave.update({
      where: { id },
      data: {
        status: dto.status,
        approverId: dto.approverId,
        comments: dto.comments,
        approvedAt: dto.status === LeaveStatus.APPROVED ? new Date() : undefined,
        rejectedAt: dto.status === LeaveStatus.REJECTED ? new Date() : undefined,
      },
      include: { employee: true, leaveType: true },
    });
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);
    return this.prisma.leave.delete({ where: { id } });
  }
}
