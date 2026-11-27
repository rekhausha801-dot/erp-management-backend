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
import { CreateSlaDto } from './dto/create-sla.dto';
import { QuerySlaDto } from './dto/query-sla.dto';
import { UpdateSlaDto } from './dto/update-sla.dto';

@Injectable()
export class SlaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateSlaDto) {
    const existing = await this.prisma.sLA.findUnique({
      where: { companyId_name: { companyId, name: dto.name } },
    });
    if (existing) {
      throw new ConflictException('SLA with this name already exists');
    }

    return this.prisma.sLA.create({
      data: { companyId, ...dto },
    });
  }

  async findAll(companyId: string, query: QuerySlaDto) {
    const { skip, take, page, limit, orderBy } = buildPaginationQuery(query);
    const where: Prisma.SLAWhereInput = {
      companyId,
      ...(query.priority ? { priority: query.priority } : {}),
      ...(query.search
        ? { name: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.sLA.findMany({ where, skip, take, orderBy }),
      this.prisma.sLA.count({ where }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }

  async findOne(companyId: string, id: string) {
    const sla = await this.prisma.sLA.findFirst({ where: { id, companyId } });
    if (!sla) {
      throw new NotFoundException('SLA not found');
    }
    return sla;
  }

  async update(companyId: string, id: string, dto: UpdateSlaDto) {
    await this.findOne(companyId, id);
    return this.prisma.sLA.update({ where: { id }, data: dto });
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);
    return this.prisma.sLA.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
