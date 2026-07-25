import { Module } from '@nestjs/common';
import { CaregiversService } from './caregivers.service.js';
import { CaregiversController } from './caregivers.controller.js';
import { AuthModule } from '../auth/auth.module.js';
import { MessagesModule } from '../messages/messages.module.js';

@Module({
  imports: [AuthModule, MessagesModule],
  controllers: [CaregiversController],
  providers: [CaregiversService],
})
export class CaregiversModule {}
