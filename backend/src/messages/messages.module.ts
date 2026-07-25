import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service.js';
import { MessagesController } from './messages.controller.js';
import { AuthModule } from '../auth/auth.module.js';
import { AiAgentModule } from '../ai-agent/ai-agent.module.js';

@Module({
  imports: [AuthModule, AiAgentModule],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
