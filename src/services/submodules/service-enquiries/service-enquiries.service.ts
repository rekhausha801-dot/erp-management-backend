import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma, Priority, ServiceStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { PrismaService } from '../../../prisma/prisma.service';
import { generateCode } from '../../../common/utils/code-generator.util';
import {
  buildPaginatedResponse,
  buildPaginationQuery,
} from '../../../common/utils/pagination.util';
import { QueryServiceDto } from '../../dto/query-service.dto';

export class CreateServiceEnquiryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  serviceCategoryId?: string;

  @ApiProperty({ example: '2026-11-26' })
  @IsDateString()
  @IsNotEmpty()
  enquiryDate: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  contactName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactEmail?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ enum: Priority, default: Priority.MEDIUM })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

@Injectable()
export class ServiceEnquiriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateServiceEnquiryDto) {
    return this.prisma.serviceEnquiry.create({
      data: {
        companyId,
        customerId: dto.customerId,
        serviceCategoryId: dto.serviceCategoryId,
        enquiryNumber: generateCode('SENQ'),
        enquiryDate: new Date(dto.enquiryDate),
        contactName: dto.contactName,
        contactPhone: dto.contactPhone,
        contactEmail: dto.contactEmail,
        description: dto.description,
        priority: dto.priority ?? Priority.MEDIUM,
        notes: dto.notes,
      },
      include: { customer: true, serviceCategory: true },
    });
  }

  async findAll(companyId: string, query: QueryServiceDto) {
    const { skip, take, page, limit, orderBy } = buildPaginationQuery(query);
    const where: Prisma.ServiceEnquiryWhereInput = {
      companyId,
      ...(query.customerId ? { customerId: query.customerId } : {}),
      ...(query.serviceCategoryId
        ? { serviceCategoryId: query.serviceCategoryId }
        : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { enquiryNumber: { contains: query.search, mode: 'insensitive' } },
              { contactName: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.serviceEnquiry.findMany({
        where,
        skip,
        take,
        orderBy,
        include: { customer: true, serviceCategory: true },
      }),
      this.prisma.serviceEnquiry.count({ where }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }

  async convertToRequest(companyId: string, id: string) {
    const enquiry = await this.prisma.serviceEnquiry.findFirst({
      where: { id, companyId },
    });
    if (!enquiry) {
      throw new NotFoundException('Service enquiry not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const request = await tx.serviceRequest.create({
        data: {
          companyId,
          customerId: enquiry.customerId,
          serviceCategoryId: enquiry.serviceCategoryId,
          requestNumber: generateCode('SREQ'),
          requestDate: new Date(),
          priority: enquiry.priority,
          description: enquiry.description,
          notes: enquiry.notes,
        },
      });

      await tx.serviceEnquiry.update({
        where: { id },
        data: {
          status: ServiceStatus.COMPLETED,
          convertedToRequestId: request.id,
        },
      });

      return request;
    });
  }
}
