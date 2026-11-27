import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceStatus } from '@prisma/client';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { PrismaService } from '../../../prisma/prisma.service';

export class CreateServiceCompletionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  serviceRequestId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  completionNotes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerFeedback?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  signature?: string;
}

@Injectable()
export class ServiceCompletionService {
  constructor(private readonly prisma: PrismaService) {}

  async complete(companyId: string, dto: CreateServiceCompletionDto) {
    const request = await this.prisma.serviceRequest.findFirst({
      where: { id: dto.serviceRequestId, companyId },
    });
    if (!request) {
      throw new NotFoundException('Service request not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const completion = await tx.serviceCompletion.create({
        data: {
          serviceRequestId: dto.serviceRequestId,
          completedAt: new Date(),
          completionNotes: dto.completionNotes,
          customerFeedback: dto.customerFeedback,
          rating: dto.rating,
          signature: dto.signature,
        },
      });

      await tx.serviceRequest.update({
        where: { id: dto.serviceRequestId },
        data: { status: ServiceStatus.COMPLETED, closedAt: new Date() },
      });

      return completion;
    });
  }

  async findByRequest(companyId: string, serviceRequestId: string) {
    const request = await this.prisma.serviceRequest.findFirst({
      where: { id: serviceRequestId, companyId },
    });
    if (!request) {
      throw new NotFoundException('Service request not found');
    }

    return this.prisma.serviceCompletion.findMany({
      where: { serviceRequestId },
      orderBy: { completedAt: 'desc' },
    });
  }
}
