import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service.js';
import { JwtAuthGuard } from '../common/jwt-auth.guard.js';
import { RolesGuard } from '../common/roles.guard.js';
import { Roles } from '../common/roles.decorator.js';
import { SendMessageDto } from './dto/send-message.dto.js';

@Controller('messages')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('individual')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Post('send')
  async sendMessage(@Req() req: any, @Body() body: SendMessageDto) {
    return this.messagesService.sendMessage(req.user.userId, body.message);
  }

  @Get('history')
  async getHistory(@Req() req: any, @Query('days') days?: string) {
    return this.messagesService.getMessageHistory(req.user.userId, days ? parseInt(days, 10) : 30);
  }

  @Get('risk-calendar')
  async getRiskCalendar(@Req() req: any) {
    return this.messagesService.getRiskCalendar(req.user.userId);
  }

  @Get('ai-knows-you-better')
  async getAiProgress(@Req() req: any) {
    return this.messagesService.getAiProgress(req.user.userId);
  }
}
