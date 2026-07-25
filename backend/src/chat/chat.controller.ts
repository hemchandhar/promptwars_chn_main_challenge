import { Body, Controller, Get, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service.js';
import { JwtAuthGuard } from '../common/jwt-auth.guard.js';
import { RolesGuard } from '../common/roles.guard.js';
import { Roles } from '../common/roles.decorator.js';
import { SendChatDto } from './dto/send-chat.dto.js';
import { AvailabilityDto } from './dto/availability.dto.js';

@Controller('api/chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('thread')
  getThread(@Req() req: any) {
    return this.chatService.getThread(req.user.userId, req.user.role);
  }

  @Get('poll')
  poll(@Req() req: any, @Query('since') since?: string) {
    return this.chatService.poll(req.user.userId, req.user.role, since);
  }

  @Post('send')
  send(@Req() req: any, @Body() body: SendChatDto) {
    return this.chatService.sendMessage(req.user.userId, req.user.role, body.text);
  }

  @Get('availability')
  @UseGuards(RolesGuard)
  @Roles('caregiver')
  getAvailability(@Req() req: any) {
    return this.chatService.getAvailability(req.user.userId);
  }

  @Patch('availability')
  @UseGuards(RolesGuard)
  @Roles('caregiver')
  setAvailability(@Req() req: any, @Body() body: AvailabilityDto) {
    return this.chatService.setAvailability(req.user.userId, body.available);
  }
}
