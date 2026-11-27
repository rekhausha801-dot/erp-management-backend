import { PartialType } from '@nestjs/swagger';
import { CreateAccountDto } from './create-finance.dto';

export class UpdateFinanceDto extends PartialType(CreateAccountDto) {}
