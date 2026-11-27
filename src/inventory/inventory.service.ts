import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, StockTransactionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  buildPaginatedResponse,
  buildPaginationQuery,
} from '../common/utils/pagination.util';
import {
  CreateInventoryItemDto,
  CreateStockTransactionDto,
  CreateWarehouseDto,
} from './dto/create-inventory.dto';
import { QueryInventoryDto } from './dto/query-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async createItem(companyId: string, dto: CreateInventoryItemDto) {
    const existing = await this.prisma.inventoryItem.findUnique({
      where: { companyId_code: { companyId, code: dto.code } },
    });
    if (existing) {
      throw new ConflictException('Inventory item code already exists');
    }
    return this.prisma.inventoryItem.create({
      data: { companyId, ...dto },
    });
  }

  async findAllItems(companyId: string, query: QueryInventoryDto) {
    const { skip, take, page, limit, orderBy } = buildPaginationQuery(query);
    const where: Prisma.InventoryItemWhereInput = {
      companyId,
      ...(query.category ? { category: query.category } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { code: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.inventoryItem.findMany({ where, skip, take, orderBy }),
      this.prisma.inventoryItem.count({ where }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }

  async findOneItem(companyId: string, id: string) {
    const item = await this.prisma.inventoryItem.findFirst({
      where: { id, companyId },
    });
    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }
    return item;
  }

  async updateItem(companyId: string, id: string, dto: UpdateInventoryDto) {
    await this.findOneItem(companyId, id);
    return this.prisma.inventoryItem.update({
      where: { id },
      data: dto,
    });
  }

  async createWarehouse(companyId: string, dto: CreateWarehouseDto) {
    const existing = await this.prisma.warehouse.findUnique({
      where: { companyId_code: { companyId, code: dto.code } },
    });
    if (existing) {
      throw new ConflictException('Warehouse code already exists');
    }
    return this.prisma.warehouse.create({ data: { companyId, ...dto } });
  }

  async findWarehouses(companyId: string) {
    return this.prisma.warehouse.findMany({
      where: { companyId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async recordStockTransaction(
    companyId: string,
    dto: CreateStockTransactionDto,
  ) {
    const item = await this.findOneItem(companyId, dto.itemId);
    const current = Number(item.currentStock);
    const delta =
      dto.transactionType === StockTransactionType.OUT
        ? -dto.quantity
        : dto.quantity;

    if (current + delta < 0) {
      throw new BadRequestException('Insufficient stock balance');
    }

    const unitCost = dto.unitCost ?? Number(item.costPrice);
    const totalCost = unitCost * dto.quantity;

    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.stockTransaction.create({
        data: {
          companyId,
          itemId: dto.itemId,
          warehouseId: dto.warehouseId,
          transactionType: dto.transactionType,
          quantity: dto.quantity,
          unitCost,
          totalCost,
          transactionDate: new Date(dto.transactionDate),
          notes: dto.notes,
        },
      });

      await tx.inventoryItem.update({
        where: { id: dto.itemId },
        data: { currentStock: current + delta },
      });

      return transaction;
    });
  }
}
