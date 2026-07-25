import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Db, MongoClient } from 'mongodb';

@Injectable()
export class MongoService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MongoService.name);
  private client: MongoClient;
  private database: Db;

  constructor(private config: ConfigService) {}

  async onModuleInit() {
    const uri = this.config.get<string>('MONGODB_URI');
    if (!uri) {
      throw new Error('MONGODB_URI is not set');
    }
    this.client = new MongoClient(uri);
    await this.client.connect();
    this.database = this.client.db('careOcare');
    this.logger.log('Connected to MongoDB');
  }

  async onModuleDestroy() {
    await this.client?.close();
  }

  get db(): Db {
    return this.database;
  }
}
