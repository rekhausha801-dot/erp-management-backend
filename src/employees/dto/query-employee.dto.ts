import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { EmployeeStatus, EmployeeType } from './create-employee.dto';

export class QueryEmployeeDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Search by name or employee code' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by department ID' })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'Filter by designation ID' })
  @IsOptional()
  @IsString()
  designationId?: string;

  @ApiPropertyOptional({ enum: EmployeeStatus, description: 'Filter by employee status' })
  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;

  @ApiPropertyOptional({ enum: EmployeeType, description: 'Filter by employee type' })
  @IsOptional()
  @IsEnum(EmployeeType)
  employeeType?: EmployeeType;
}
