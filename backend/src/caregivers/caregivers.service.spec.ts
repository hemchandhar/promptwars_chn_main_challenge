import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { CaregiversService } from './caregivers.service.js';
import { makeMockMongoService } from '../test-utils/mock-mongo.js';

function makeMessagesServiceStub() {
  return { getRiskCalendar: jest.fn(async () => [{ date: 1, day: 'Monday', risk_level: 'low' }]) };
}

describe('CaregiversService', () => {
  it('links a caregiver to an existing individual', async () => {
    const caregiverId = new ObjectId();
    const individualId = new ObjectId();
    const mongo = makeMockMongoService({
      users: [
        { _id: caregiverId, role: 'caregiver', supportingUsers: [] },
        { _id: individualId, role: 'individual' },
      ],
    });
    const service = new CaregiversService(mongo as any, makeMessagesServiceStub() as any);

    await service.linkIndividual(caregiverId.toString(), individualId.toString());
    const list = await service.myIndividuals(caregiverId.toString());
    expect(list).toHaveLength(1);
    expect(list[0].userId).toBe(individualId.toString());
  });

  it('refuses to link a non-existent individual', async () => {
    const caregiverId = new ObjectId();
    const mongo = makeMockMongoService({ users: [{ _id: caregiverId, role: 'caregiver' }] });
    const service = new CaregiversService(mongo as any, makeMessagesServiceStub() as any);

    await expect(service.linkIndividual(caregiverId.toString(), new ObjectId().toString())).rejects.toThrow(NotFoundException);
  });

  it('blocks a caregiver from reading an individual they are not linked to (IDOR)', async () => {
    const caregiverId = new ObjectId();
    const strangerIndividualId = new ObjectId();
    const mongo = makeMockMongoService({ users: [{ _id: caregiverId, role: 'caregiver', supportingUsers: [] }] });
    const service = new CaregiversService(mongo as any, makeMessagesServiceStub() as any);

    await expect(service.getSupportedActivity(caregiverId.toString(), strangerIndividualId.toString())).rejects.toThrow(ForbiddenException);
    await expect(service.getSupportedRiskCalendar(caregiverId.toString(), strangerIndividualId.toString())).rejects.toThrow(ForbiddenException);
    await expect(service.sendEncouragement(caregiverId.toString(), strangerIndividualId.toString(), 'hi')).rejects.toThrow(ForbiddenException);
  });

  it('allows a linked caregiver to read their individual\'s activity and send encouragement', async () => {
    const caregiverId = new ObjectId();
    const individualId = new ObjectId();
    const mongo = makeMockMongoService({
      users: [{ _id: caregiverId, role: 'caregiver', supportingUsers: [individualId] }],
      messages: [{ userId: individualId, content: 'hi', timestamp: new Date() }],
    });
    const service = new CaregiversService(mongo as any, makeMessagesServiceStub() as any);

    const activity = await service.getSupportedActivity(caregiverId.toString(), individualId.toString());
    expect(activity.messages).toHaveLength(1);

    const res = await service.sendEncouragement(caregiverId.toString(), individualId.toString(), 'You are doing great');
    expect(res.message).toBe('Encouragement sent');
    expect(mongo.db.collection('caregiver_alerts')._docs()).toHaveLength(1);
  });
});
