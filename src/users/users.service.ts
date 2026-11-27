import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role as PrismaRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import {
  buildPaginatedResponse,
  buildPaginationQuery,
} from '../common/utils/pagination.util';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      const membership = await this.prisma.userCompany.findUnique({
        where: { userId_companyId: { userId: existing.id, companyId } },
      });
      if (membership) {
        throw new ConflictException('User already belongs to this company');
      }
      await this.prisma.userCompany.create({
        data: {
          userId: existing.id,
          companyId,
          role: (dto.role as PrismaRole) ?? PrismaRole.EMPLOYEE,
        },
      });
      return this.sanitizeUser(existing, dto.role ?? 'EMPLOYEE', companyId);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const created = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          isActive: dto.isActive ?? true,
        },
      });
      await tx.userCompany.create({
        data: {
          userId: user.id,
          companyId,
          role: (dto.role as PrismaRole) ?? PrismaRole.EMPLOYEE,
        },
      });
      return user;
    });

    return this.sanitizeUser(created, dto.role ?? 'EMPLOYEE', companyId);
  }

  async findAll(companyId: string, query: QueryUserDto) {
    const { skip, take, page, limit, orderBy } = buildPaginationQuery(query);
    const where: Prisma.UserCompanyWhereInput = {
      companyId,
      ...(query.role ? { role: query.role as PrismaRole } : {}),
      ...(query.search
        ? {
            user: {
              OR: [
                { firstName: { contains: query.search, mode: 'insensitive' } },
                { lastName: { contains: query.search, mode: 'insensitive' } },
                { email: { contains: query.search, mode: 'insensitive' } },
              ],
            },
          }
        : {}),
    };

    const [rows, total] = await Promise.all([
      this.prisma.userCompany.findMany({
        where,
        skip,
        take,
        include: { user: true },
        orderBy:
          query.sortBy && query.sortBy !== 'createdAt'
            ? { user: orderBy }
            : orderBy,
      }),
      this.prisma.userCompany.count({ where }),
    ]);

    const items = rows.map((uc) =>
      this.sanitizeUser(uc.user, uc.role, uc.companyId),
    );
    return buildPaginatedResponse(items, total, page, limit);
  }

  async findOne(companyId: string, id: string) {
    const uc = await this.prisma.userCompany.findUnique({
      where: { userId_companyId: { userId: id, companyId } },
      include: { user: true },
    });
    if (!uc) {
      throw new NotFoundException('User not found in this company');
    }
    return this.sanitizeUser(uc.user, uc.role, uc.companyId);
  }

  async update(companyId: string, id: string, dto: UpdateUserDto) {
    const existing = await this.prisma.userCompany.findUnique({
      where: { userId_companyId: { userId: id, companyId } },
    });
    if (!existing) {
      throw new NotFoundException('User not found in this company');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (dto.role) {
        await tx.userCompany.update({
          where: { userId_companyId: { userId: id, companyId } },
          data: { role: dto.role as PrismaRole },
        });
      }
      return tx.user.update({
        where: { id },
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          isActive: dto.isActive,
        },
      });
    });

    return this.sanitizeUser(updated, dto.role ?? existing.role, companyId);
  }

  async remove(companyId: string, id: string) {
    const existing = await this.prisma.userCompany.findUnique({
      where: { userId_companyId: { userId: id, companyId } },
    });
    if (!existing) {
      throw new NotFoundException('User not found in this company');
    }
    return this.prisma.userCompany.update({
      where: { userId_companyId: { userId: id, companyId } },
      data: { isActive: false },
    });
  }

  private sanitizeUser(
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      phone: string | null;
      avatar: string | null;
      isActive: boolean;
      lastLoginAt: Date | null;
      createdAt: Date;
    },
    role: string,
    companyId: string,
  ) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatar: user.avatar,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      role,
      companyId,
    };
  }
}
