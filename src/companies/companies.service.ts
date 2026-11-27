import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../common/enums/role.enum';
import {
  buildPaginatedResponse,
  buildPaginationQuery,
} from '../common/utils/pagination.util';
import { CreateCompanyDto } from './dto/create-company.dto';
import { QueryCompanyDto } from './dto/query-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCompanyDto) {
    const existing = await this.prisma.company.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Company with this email already exists');
    }

    return this.prisma.company.create({ data: dto });
  }

  async findAll(query: QueryCompanyDto, userId: string, role: string) {
    const { skip, take, page, limit, orderBy } = buildPaginationQuery(query);
    const where: Prisma.CompanyWhereInput = {};

    if (role !== Role.SUPER_ADMIN) {
      where.users = {
        some: {
          userId,
          isActive: true,
        },
      };
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.company.findMany({ where, skip, take, orderBy }),
      this.prisma.company.count({ where }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }

  async findOne(id: string, userId: string, role: string) {
    if (role !== Role.SUPER_ADMIN) {
      const membership = await this.prisma.userCompany.findUnique({
        where: { userId_companyId: { userId, companyId: id } },
      });
      if (!membership || !membership.isActive) {
        throw new ForbiddenException('Access denied to this company');
      }
    }

    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company;
  }

  async update(
    id: string,
    dto: UpdateCompanyDto,
    userId: string,
    role: string,
    currentCompanyId: string,
  ) {
    if (role !== Role.SUPER_ADMIN && id !== currentCompanyId) {
      throw new ForbiddenException('You can only update your own company');
    }
    await this.findOne(id, userId, role);

    return this.prisma.company.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return this.prisma.company.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
