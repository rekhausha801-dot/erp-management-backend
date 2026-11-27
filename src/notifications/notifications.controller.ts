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
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Send a notification' })
  create(
    @CompanyId() companyId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateNotificationDto,
  ) {
    return this.notificationsService.create(companyId, userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List current user notifications' })
  findMine(
    @CompanyId() companyId: string,
    @CurrentUser('userId') userId: string,
    @Query() query: QueryNotificationDto,
  ) {
    return this.notificationsService.findMine(companyId, userId, query);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  markRead(
    @CompanyId() companyId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
  ) {
    return this.notificationsService.markRead(companyId, userId, id);
  }
}
