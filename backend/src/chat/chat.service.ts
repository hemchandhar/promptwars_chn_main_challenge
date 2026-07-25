import { Injectable, NotFoundException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { MongoService } from '../common/mongo.service.js';

type Role = 'individual' | 'caregiver';

@Injectable()
export class ChatService {
  constructor(private mongo: MongoService) {}

  private get users() {
    return this.mongo.db.collection('users');
  }
  private get chatMessages() {
    return this.mongo.db.collection('chat_messages');
  }

  private async resolveCounterpart(userId: string, role: Role) {
    if (role === 'individual') {
      const caregiver = await this.users.findOne({ role: 'caregiver', supportingUsers: new ObjectId(userId) });
      if (!caregiver) return null;
      return { userId: caregiver._id.toString(), email: caregiver.email, role: 'caregiver' as const, available: !!caregiver.isAvailable };
    }
    const me = await this.users.findOne({ _id: new ObjectId(userId) });
    const individualId: ObjectId | undefined = (me?.supportingUsers || [])[0];
    if (!individualId) return null;
    const individual = await this.users.findOne({ _id: individualId });
    if (!individual) return null;
    return { userId: individual._id.toString(), email: individual.email, role: 'individual' as const, available: null };
  }

  private threadIds(userId: string, role: Role, counterpartId: string) {
    return role === 'individual'
      ? { individualId: userId, caregiverId: counterpartId }
      : { individualId: counterpartId, caregiverId: userId };
  }

  async getThread(userId: string, role: Role) {
    const counterpart = await this.resolveCounterpart(userId, role);
    if (!counterpart) return { counterpart: null, messages: [] };

    const { individualId, caregiverId } = this.threadIds(userId, role, counterpart.userId);
    const messages = await this.chatMessages
      .find({ individualId: new ObjectId(individualId), caregiverId: new ObjectId(caregiverId) })
      .sort({ timestamp: 1 })
      .limit(200)
      .toArray();

    return { counterpart, messages };
  }

  async sendMessage(userId: string, role: Role, text: string) {
    const counterpart = await this.resolveCounterpart(userId, role);
    if (!counterpart) throw new NotFoundException('No linked caregiver/individual to message yet');

    const { individualId, caregiverId } = this.threadIds(userId, role, counterpart.userId);
    const doc = {
      individualId: new ObjectId(individualId),
      caregiverId: new ObjectId(caregiverId),
      senderId: new ObjectId(userId),
      senderRole: role,
      text,
      timestamp: new Date(),
      read: false,
    };
    await this.chatMessages.insertOne(doc);
    return doc;
  }

  async poll(userId: string, role: Role, since?: string) {
    const counterpart = await this.resolveCounterpart(userId, role);
    if (!counterpart) return { counterpart: null, messages: [] };

    const { individualId, caregiverId } = this.threadIds(userId, role, counterpart.userId);
    const filter: Record<string, unknown> = { individualId: new ObjectId(individualId), caregiverId: new ObjectId(caregiverId) };
    const sinceDate = since ? new Date(since) : null;
    if (sinceDate && !Number.isNaN(sinceDate.getTime())) {
      filter.timestamp = { $gt: sinceDate };
    }

    const messages = await this.chatMessages.find(filter).sort({ timestamp: 1 }).toArray();
    return { counterpart, messages };
  }

  async getAvailability(caregiverId: string) {
    const caregiver = await this.users.findOne({ _id: new ObjectId(caregiverId) });
    return { available: !!caregiver?.isAvailable };
  }

  async setAvailability(caregiverId: string, available: boolean) {
    await this.users.updateOne(
      { _id: new ObjectId(caregiverId) },
      { $set: { isAvailable: available, availabilityUpdatedAt: new Date() } },
    );
    return { available };
  }
}
