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
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateAttendanceDto) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: dto.employeeId, companyId },
    });
    if (!employee) {
      throw new NotFoundException('Employee not found in this company');
    }

    const date = new Date(dto.date);
    const existing = await this.prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId: dto.employeeId, date } },
    });
    if (existing) {
      throw new ConflictException(
        'Attendance already recorded for this employee on this date',
      );
    }

    return this.prisma.attendance.create({
      data: {
        companyId,
        employeeId: dto.employeeId,
        date,
        checkIn: dto.checkIn ? new Date(dto.checkIn) : undefined,
        checkOut: dto.checkOut ? new Date(dto.checkOut) : undefined,
        status: dto.status,
        workHours: dto.workHours,
        overtime: dto.overtime,
        notes: dto.notes,
        location: dto.location,
      },
      include: { employee: true },
    });
  }

  async findAll(companyId: string, query: QueryAttendanceDto) {
    const { skip, take, page, limit, orderBy } = buildPaginationQuery(query);
    const where: Prisma.AttendanceWhereInput = {
      companyId,
      ...(query.employeeId ? { employeeId: query.employeeId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.fromDate || query.toDate
        ? {
            date: {
              ...(query.fromDate ? { gte: new Date(query.fromDate) } : {}),
              ...(query.toDate ? { lte: new Date(query.toDate) } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where,
        skip,
        take,
        orderBy,
        include: { employee: true },
      }),
      this.prisma.attendance.count({ where }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }

  async findOne(companyId: string, id: string) {
    const record = await this.prisma.attendance.findFirst({
      where: { id, companyId },
      include: { employee: true },
    });
    if (!record) {
      throw new NotFoundException('Attendance record not found');
    }
    return record;
  }

  async update(companyId: string, id: string, dto: UpdateAttendanceDto) {
    await this.findOne(companyId, id);
    return this.prisma.attendance.update({
      where: { id },
      data: {
        checkIn: dto.checkIn ? new Date(dto.checkIn) : undefined,
        checkOut: dto.checkOut ? new Date(dto.checkOut) : undefined,
        status: dto.status,
        workHours: dto.workHours,
        overtime: dto.overtime,
        notes: dto.notes,
        location: dto.location,
      },
      include: { employee: true },
    });
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);
    return this.prisma.attendance.delete({ where: { id } });
  }
}
