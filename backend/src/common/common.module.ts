import { Global, Module } from '@nestjs/common';
import { MongoService } from './mongo.service.js';
import { RolesGuard } from './roles.guard.js';

@Global()
@Module({
  providers: [MongoService, RolesGuard],
  exports: [MongoService, RolesGuard],
})
export class CommonModule {}
