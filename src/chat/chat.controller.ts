import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CompanyId } from '../common/decorators/company-id.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ChatService } from './chat.service';
import { CreateChatDto, CreateChatMessageDto } from './dto/create-chat.dto';

@ApiTags('Internal Chat')
@ApiBearerAuth()
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @ApiOperation({ summary: 'Create a chat room' })
  createChat(
    @CompanyId() companyId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateChatDto,
  ) {
    return this.chatService.createChat(companyId, userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List my chats in current company' })
  findMyChats(
    @CompanyId() companyId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.chatService.findMyChats(companyId, userId);
  }

  @Post(':chatId/messages')
  @ApiOperation({ summary: 'Send a message in a chat' })
  sendMessage(
    @CompanyId() companyId: string,
    @Param('chatId') chatId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateChatMessageDto,
  ) {
    return this.chatService.sendMessage(companyId, chatId, userId, dto);
  }

  @Get(':chatId/messages')
  @ApiOperation({ summary: 'Get messages for a chat' })
  getMessages(
    @CompanyId() companyId: string,
    @Param('chatId') chatId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.chatService.getMessages(companyId, chatId, userId);
  }
}
