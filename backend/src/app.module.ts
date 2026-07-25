import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { SpaController } from './spa.controller.js';
import { CommonModule } from './common/common.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { AiAgentModule } from './ai-agent/ai-agent.module.js';
import { MessagesModule } from './messages/messages.module.js';
import { CaregiversModule } from './caregivers/caregivers.module.js';
import { ChatModule } from './chat/chat.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api*'],
    }),
    CommonModule,
    AuthModule,
    UsersModule,
    AiAgentModule,
    MessagesModule,
    CaregiversModule,
    ChatModule,
  ],
  // AppController's "/" health check, then static assets, then SpaController's
  // catch-all — order matters: SpaController must be registered last so it only
  // catches routes nothing else matched.
  controllers: [AppController, SpaController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
