import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CompanyId } from '../../../common/decorators/company-id.decorator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import {
  CreateSalesReturnDto,
  SalesReturnsService,
} from './sales-returns.service';

@ApiTags('Sales - Returns')
@ApiBearerAuth()
@Controller('sales/returns')
export class SalesReturnsController {
  constructor(private readonly salesReturnsService: SalesReturnsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a sales return' })
  create(@CompanyId() companyId: string, @Body() dto: CreateSalesReturnDto) {
    return this.salesReturnsService.create(companyId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List sales returns' })
  findAll(@CompanyId() companyId: string, @Query() query: PaginationDto) {
    return this.salesReturnsService.findAll(companyId, query);
  }
}
