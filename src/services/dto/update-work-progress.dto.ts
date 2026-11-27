import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateWorkProgressDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  workOrderId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiProperty({ example: '2026-11-26' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: 4.5 })
  @IsNumber()
  hoursWorked: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  materials?: string;
}

export class UpdateWorkProgressDto extends CreateWorkProgressDto {}
