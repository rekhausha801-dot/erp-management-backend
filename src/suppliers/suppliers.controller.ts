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
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { QuerySupplierDto } from './dto/query-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SuppliersService } from './suppliers.service';

@ApiTags('Suppliers')
@ApiBearerAuth()
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @ApiOperation({ summary: 'Create supplier' })
  create(@CompanyId() companyId: string, @Body() dto: CreateSupplierDto) {
    return this.suppliersService.create(companyId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List suppliers' })
  findAll(@CompanyId() companyId: string, @Query() query: QuerySupplierDto) {
    return this.suppliersService.findAll(companyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get supplier by ID' })
  findOne(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.suppliersService.findOne(companyId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update supplier' })
  update(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSupplierDto,
  ) {
    return this.suppliersService.update(companyId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate supplier' })
  remove(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.suppliersService.remove(companyId, id);
  }
}
