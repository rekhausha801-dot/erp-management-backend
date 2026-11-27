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
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CreateSlaDto } from './dto/create-sla.dto';
import { QuerySlaDto } from './dto/query-sla.dto';
import { UpdateSlaDto } from './dto/update-sla.dto';
import { SlaService } from './sla.service';

@ApiTags('SLA Management')
@ApiBearerAuth()
@Controller('sla')
export class SlaController {
  constructor(private readonly slaService: SlaService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SUPERVISOR)
  @ApiOperation({ summary: 'Create an SLA policy' })
  create(@CompanyId() companyId: string, @Body() dto: CreateSlaDto) {
    return this.slaService.create(companyId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List SLAs' })
  findAll(@CompanyId() companyId: string, @Query() query: QuerySlaDto) {
    return this.slaService.findAll(companyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get SLA by ID' })
  findOne(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.slaService.findOne(companyId, id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SUPERVISOR)
  @ApiOperation({ summary: 'Update SLA' })
  update(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSlaDto,
  ) {
    return this.slaService.update(companyId, id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Deactivate SLA' })
  remove(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.slaService.remove(companyId, id);
  }
}
