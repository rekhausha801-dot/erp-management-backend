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
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import {
  CreateInventoryItemDto,
  CreateStockTransactionDto,
  CreateWarehouseDto,
} from './dto/create-inventory.dto';
import { QueryInventoryDto } from './dto/query-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { InventoryService } from './inventory.service';

@ApiTags('Inventory & Warehouses')
@ApiBearerAuth()
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('items')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.STORE_MANAGER)
  @ApiOperation({ summary: 'Create inventory item' })
  createItem(
    @CompanyId() companyId: string,
    @Body() dto: CreateInventoryItemDto,
  ) {
    return this.inventoryService.createItem(companyId, dto);
  }

  @Get('items')
  @ApiOperation({ summary: 'List inventory items' })
  findAllItems(
    @CompanyId() companyId: string,
    @Query() query: QueryInventoryDto,
  ) {
    return this.inventoryService.findAllItems(companyId, query);
  }

  @Get('items/:id')
  @ApiOperation({ summary: 'Get inventory item by ID' })
  findOneItem(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.inventoryService.findOneItem(companyId, id);
  }

  @Patch('items/:id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.STORE_MANAGER)
  @ApiOperation({ summary: 'Update inventory item' })
  updateItem(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateInventoryDto,
  ) {
    return this.inventoryService.updateItem(companyId, id, dto);
  }

  @Post('warehouses')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.STORE_MANAGER)
  @ApiOperation({ summary: 'Create warehouse' })
  createWarehouse(
    @CompanyId() companyId: string,
    @Body() dto: CreateWarehouseDto,
  ) {
    return this.inventoryService.createWarehouse(companyId, dto);
  }

  @Get('warehouses')
  @ApiOperation({ summary: 'List warehouses' })
  findWarehouses(@CompanyId() companyId: string) {
    return this.inventoryService.findWarehouses(companyId);
  }

  @Post('transactions')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.STORE_MANAGER)
  @ApiOperation({ summary: 'Record stock transaction (IN/OUT/ADJUSTMENT)' })
  recordTransaction(
    @CompanyId() companyId: string,
    @Body() dto: CreateStockTransactionDto,
  ) {
    return this.inventoryService.recordStockTransaction(companyId, dto);
  }
}
