import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CompanyId } from '../common/decorators/company-id.decorator';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { QueryPaymentDto } from './dto/query-payment.dto';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Record a payment against an invoice' })
  create(@CompanyId() companyId: string, @Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(companyId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List payments' })
  findAll(@CompanyId() companyId: string, @Query() query: QueryPaymentDto) {
    return this.paymentsService.findAll(companyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  findOne(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.paymentsService.findOne(companyId, id);
  }
}
