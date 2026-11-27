import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CompanyId } from '../../../common/decorators/company-id.decorator';
import { CreateServiceCategoryDto } from '../../dto/create-service.dto';
import { UpdateServiceCategoryDto } from '../../dto/update-service.dto';
import { ServiceCategoriesService } from './service-categories.service';

@ApiTags('Services - Categories')
@ApiBearerAuth()
@Controller('services/categories')
export class ServiceCategoriesController {
  constructor(
    private readonly serviceCategoriesService: ServiceCategoriesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create service category' })
  create(
    @CompanyId() companyId: string,
    @Body() dto: CreateServiceCategoryDto,
  ) {
    return this.serviceCategoriesService.create(companyId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List service categories' })
  findAll(@CompanyId() companyId: string) {
    return this.serviceCategoriesService.findAll(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service category by ID' })
  findOne(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.serviceCategoriesService.findOne(companyId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update service category' })
  update(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateServiceCategoryDto,
  ) {
    return this.serviceCategoriesService.update(companyId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate service category' })
  remove(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.serviceCategoriesService.remove(companyId, id);
  }
}
