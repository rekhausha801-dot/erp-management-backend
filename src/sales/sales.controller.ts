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
import { CompanyId } from '../common/decorators/company-id.decorator';
import { CreateLeadDto, CreateSalesDto } from './dto/create-sales.dto';
import { QuerySalesDto } from './dto/query-sales.dto';
import { UpdateLeadDto, UpdateSalesDto } from './dto/update-sales.dto';
import { SalesService } from './sales.service';

@ApiTags('Sales Management')
@ApiBearerAuth()
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get Sales Dashboard metrics' })
  getDashboard(@CompanyId() companyId: string) {
    return this.salesService.getDashboard(companyId);
  }

  @Post('leads')
  @ApiOperation({ summary: 'Create a sales lead' })
  createLead(@CompanyId() companyId: string, @Body() dto: CreateLeadDto) {
    return this.salesService.createLead(companyId, dto);
  }

  @Get('leads')
  @ApiOperation({ summary: 'List sales leads' })
  findLeads(@CompanyId() companyId: string, @Query() query: QuerySalesDto) {
    return this.salesService.findLeads(companyId, query);
  }

  @Patch('leads/:id')
  @ApiOperation({ summary: 'Update sales lead' })
  updateLead(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateLeadDto,
  ) {
    return this.salesService.updateLead(companyId, id, dto);
  }

  @Post()
  @ApiOperation({ summary: 'Create a direct sale record' })
  create(@CompanyId() companyId: string, @Body() dto: CreateSalesDto) {
    return this.salesService.create(companyId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List sales with pagination and filtering' })
  findAll(@CompanyId() companyId: string, @Query() query: QuerySalesDto) {
    return this.salesService.findAll(companyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sale by ID' })
  findOne(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.salesService.findOne(companyId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update sale' })
  update(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSalesDto,
  ) {
    return this.salesService.update(companyId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete sale' })
  remove(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.salesService.remove(companyId, id);
  }
}
