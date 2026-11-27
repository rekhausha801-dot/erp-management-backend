import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CompanyId } from '../../../common/decorators/company-id.decorator';
import {
  CreateServiceCompletionDto,
  ServiceCompletionService,
} from './service-completion.service';

@ApiTags('Services - Completion')
@ApiBearerAuth()
@Controller('services/completion')
export class ServiceCompletionController {
  constructor(
    private readonly serviceCompletionService: ServiceCompletionService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Record service completion' })
  complete(
    @CompanyId() companyId: string,
    @Body() dto: CreateServiceCompletionDto,
  ) {
    return this.serviceCompletionService.complete(companyId, dto);
  }

  @Get('request/:serviceRequestId')
  @ApiOperation({ summary: 'Get completion records for a service request' })
  findByRequest(
    @CompanyId() companyId: string,
    @Param('serviceRequestId') serviceRequestId: string,
  ) {
    return this.serviceCompletionService.findByRequest(
      companyId,
      serviceRequestId,
    );
  }
}
