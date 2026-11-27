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
import { CreateExpenseDto } from './dto/create-expense.dto';
import { QueryExpenseDto } from './dto/query-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpensesService } from './expenses.service';

@ApiTags('Expenses')
@ApiBearerAuth()
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Record an expense' })
  create(@CompanyId() companyId: string, @Body() dto: CreateExpenseDto) {
    return this.expensesService.create(companyId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List expenses' })
  findAll(@CompanyId() companyId: string, @Query() query: QueryExpenseDto) {
    return this.expensesService.findAll(companyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get expense by ID' })
  findOne(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.expensesService.findOne(companyId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Approve or update expense' })
  update(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateExpenseDto,
  ) {
    return this.expensesService.update(companyId, id, dto);
  }
}
