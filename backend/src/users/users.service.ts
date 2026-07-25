import { Injectable, NotFoundException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { MongoService } from '../common/mongo.service.js';

@Injectable()
export class UsersService {
  constructor(private mongo: MongoService) {}

  private get users() {
    return this.mongo.db.collection('users');
  }

  async findById(userId: string) {
    const user = await this.users.findOne({ _id: new ObjectId(userId) });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async saveOnboarding(
    userId: string,
    payload: { journey?: string; triggers?: string[]; supportContact?: string; copingStrategies?: string[] },
  ) {
    const _id = new ObjectId(userId);
    const update: Record<string, any> = { updatedAt: new Date() };
    if (payload.triggers) update.triggers = payload.triggers;
    if (payload.copingStrategies) update.copingStrategies = payload.copingStrategies;
    if (payload.journey) update.recoveryJourney = payload.journey;
    if (payload.supportContact) update.supportNetwork = [payload.supportContact];

    await this.users.updateOne({ _id }, { $set: update });
    const user = await this.users.findOne({ _id });
    return { message: 'Onboarding saved', user };
  }

  async lookupByEmail(email: string) {
    const user = await this.users.findOne({ email });
    if (!user) throw new NotFoundException('No user found with that email');
    return { userId: user._id.toString(), email: user.email, role: user.role };
  }
}
