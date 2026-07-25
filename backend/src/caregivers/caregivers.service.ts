import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { MongoService } from '../common/mongo.service.js';
import { MessagesService } from '../messages/messages.service.js';

@Injectable()
export class CaregiversService {
  constructor(
    private mongo: MongoService,
    private messagesService: MessagesService,
  ) {}

  private get users() {
    return this.mongo.db.collection('users');
  }
  private get messages() {
    return this.mongo.db.collection('messages');
  }
  private get alerts() {
    return this.mongo.db.collection('caregiver_alerts');
  }

  /** Throws unless `caregiverId` is actually linked to `individualId` — prevents IDOR on supported-user data. */
  private async assertLinked(caregiverId: string, individualId: string) {
    const caregiver = await this.users.findOne({ _id: new ObjectId(caregiverId) });
    const linked = (caregiver?.supportingUsers || []).some((id: ObjectId) => id.toString() === individualId);
    if (!linked) {
      throw new ForbiddenException('You are not linked to this individual');
    }
  }

  async linkIndividual(caregiverId: string, individualId: string) {
    const individual = await this.users.findOne({ _id: new ObjectId(individualId), role: 'individual' });
    if (!individual) throw new NotFoundException('Individual not found');

    await this.users.updateOne(
      { _id: new ObjectId(caregiverId) },
      { $addToSet: { supportingUsers: new ObjectId(individualId) } },
    );
    return { message: 'Individual linked successfully' };
  }

  async myIndividuals(caregiverId: string) {
    const caregiver = await this.users.findOne({ _id: new ObjectId(caregiverId) });
    const ids: ObjectId[] = caregiver?.supportingUsers || [];
    if (!ids.length) return [];
    const individuals = await this.users.find({ _id: { $in: ids } }).toArray();
    return individuals.map((u) => ({ userId: u._id.toString(), email: u.email }));
  }

  async getSupportedActivity(caregiverId: string, individualId: string) {
    await this.assertLinked(caregiverId, individualId);

    const recentMessages = await this.messages
      .find({ userId: new ObjectId(individualId) })
      .sort({ timestamp: -1 })
      .limit(20)
      .toArray();

    const alerts = await this.alerts
      .find({ individualId: new ObjectId(individualId) })
      .sort({ created_at: -1 })
      .toArray();

    return { messages: recentMessages, alerts };
  }

  async getSupportedRiskCalendar(caregiverId: string, individualId: string) {
    await this.assertLinked(caregiverId, individualId);
    return this.messagesService.getRiskCalendar(individualId);
  }

  async sendEncouragement(caregiverId: string, individualId: string, message: string) {
    await this.assertLinked(caregiverId, individualId);
    await this.alerts.insertOne({
      caregiverId: new ObjectId(caregiverId),
      individualId: new ObjectId(individualId),
      alert_type: 'encouragement',
      message,
      read: false,
      created_at: new Date(),
    });
    return { message: 'Encouragement sent' };
  }

  async pollForAlerts(caregiverId: string, individualId: string) {
    return this.alerts
      .find({ caregiverId: new ObjectId(caregiverId), individualId: new ObjectId(individualId), read: false })
      .sort({ created_at: -1 })
      .toArray();
  }

  async createAlert(caregiverId: string, individualId: string, alertType: string, message: string) {
    await this.alerts.insertOne({
      caregiverId: new ObjectId(caregiverId),
      individualId: new ObjectId(individualId),
      alert_type: alertType,
      message,
      read: false,
      created_at: new Date(),
    });
  }

  /** Every caregiver linked to this individual — used to fan out crisis alerts. */
  async caregiversFor(individualId: string) {
    return this.users.find({ role: 'caregiver', supportingUsers: new ObjectId(individualId) }).toArray();
  }
}
