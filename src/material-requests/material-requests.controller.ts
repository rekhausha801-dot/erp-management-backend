import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CompanyId } from '../common/decorators/company-id.decorator';
import { CreateMaterialRequestDto } from './dto/create-material-request.dto';
import { QueryMaterialRequestDto } from './dto/query-material-request.dto';
import { UpdateMaterialRequestDto } from './dto/update-material-request.dto';
import { MaterialRequestsService } from './material-requests.service';

@ApiTags('Material Requests')
@ApiBearerAuth()
@Controller('material-requests')
export class MaterialRequestsController {
  constructor(
    private readonly materialRequestsService: MaterialRequestsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a material request' })
  create(
    @CompanyId() companyId: string,
    @Body() dto: CreateMaterialRequestDto,
  ) {
    return this.materialRequestsService.create(companyId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List material requests' })
  findAll(
    @CompanyId() companyId: string,
    @Query() query: QueryMaterialRequestDto,
  ) {
    return this.materialRequestsService.findAll(companyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get material request by ID' })
  findOne(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.materialRequestsService.findOne(companyId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update material request' })
  update(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateMaterialRequestDto,
  ) {
    return this.materialRequestsService.update(companyId, id, dto);
  }
}
