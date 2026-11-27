import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SalesStatus } from '@prisma/client';
import { CompanyId } from '../../../common/decorators/company-id.decorator';
import { CreateQuotationDto } from '../../dto/create-quotation.dto';
import { QuerySalesDto } from '../../dto/query-sales.dto';
import { QuotationsService } from './quotations.service';

@ApiTags('Sales - Quotations')
@ApiBearerAuth()
@Controller('sales/quotations')
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a sales quotation' })
  create(@CompanyId() companyId: string, @Body() dto: CreateQuotationDto) {
    return this.quotationsService.create(companyId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List sales quotations' })
  findAll(@CompanyId() companyId: string, @Query() query: QuerySalesDto) {
    return this.quotationsService.findAll(companyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get quotation by ID' })
  findOne(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.quotationsService.findOne(companyId, id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update quotation status' })
  updateStatus(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body('status') status: SalesStatus,
  ) {
    return this.quotationsService.updateStatus(companyId, id, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete quotation' })
  remove(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.quotationsService.remove(companyId, id);
  }
}
