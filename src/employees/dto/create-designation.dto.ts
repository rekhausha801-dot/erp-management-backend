import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDesignationDto {
  @ApiProperty({ example: 'Senior Software Engineer', description: 'Designation name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Senior level software engineering role', description: 'Designation description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
