import { NotFoundException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { ChatService } from './chat.service.js';
import { makeMockMongoService } from '../test-utils/mock-mongo.js';

describe('ChatService', () => {
  it('resolves the individual\'s linked caregiver as the chat counterpart', async () => {
    const individualId = new ObjectId();
    const caregiverId = new ObjectId();
    const mongo = makeMockMongoService({
      users: [
        { _id: individualId, email: 'ind@example.com', role: 'individual' },
        { _id: caregiverId, email: 'care@example.com', role: 'caregiver', supportingUsers: [individualId], isAvailable: true },
      ],
    });
    const service = new ChatService(mongo as any);

    const thread = await service.getThread(individualId.toString(), 'individual');
    expect(thread.counterpart).toEqual(expect.objectContaining({ userId: caregiverId.toString(), role: 'caregiver', available: true }));
  });

  it('resolves the caregiver\'s first supported individual as the chat counterpart', async () => {
    const individualId = new ObjectId();
    const caregiverId = new ObjectId();
    const mongo = makeMockMongoService({
      users: [
        { _id: individualId, email: 'ind@example.com', role: 'individual' },
        { _id: caregiverId, email: 'care@example.com', role: 'caregiver', supportingUsers: [individualId] },
      ],
    });
    const service = new ChatService(mongo as any);

    const thread = await service.getThread(caregiverId.toString(), 'caregiver');
    expect(thread.counterpart).toEqual(expect.objectContaining({ userId: individualId.toString(), role: 'individual' }));
  });

  it('returns no counterpart when nobody is linked yet', async () => {
    const individualId = new ObjectId();
    const mongo = makeMockMongoService({ users: [{ _id: individualId, email: 'ind@example.com', role: 'individual' }] });
    const service = new ChatService(mongo as any);

    const thread = await service.getThread(individualId.toString(), 'individual');
    expect(thread.counterpart).toBeNull();
    expect(thread.messages).toEqual([]);
  });

  it('refuses to send a message when there is no linked counterpart', async () => {
    const individualId = new ObjectId();
    const mongo = makeMockMongoService({ users: [{ _id: individualId, email: 'ind@example.com', role: 'individual' }] });
    const service = new ChatService(mongo as any);

    await expect(service.sendMessage(individualId.toString(), 'individual', 'hello?')).rejects.toThrow(NotFoundException);
  });

  it('delivers a sent message back through getThread for both participants', async () => {
    const individualId = new ObjectId();
    const caregiverId = new ObjectId();
    const mongo = makeMockMongoService({
      users: [
        { _id: individualId, email: 'ind@example.com', role: 'individual' },
        { _id: caregiverId, email: 'care@example.com', role: 'caregiver', supportingUsers: [individualId] },
      ],
    });
    const service = new ChatService(mongo as any);

    await service.sendMessage(individualId.toString(), 'individual', 'hi there');
    const fromCaregiver = await service.getThread(caregiverId.toString(), 'caregiver');
    expect(fromCaregiver.messages).toHaveLength(1);
    expect(fromCaregiver.messages[0].text).toBe('hi there');
  });

  it('reports and updates caregiver availability', async () => {
    const caregiverId = new ObjectId();
    const mongo = makeMockMongoService({ users: [{ _id: caregiverId, role: 'caregiver', isAvailable: false }] });
    const service = new ChatService(mongo as any);

    expect((await service.getAvailability(caregiverId.toString())).available).toBe(false);
    await service.setAvailability(caregiverId.toString(), true);
    expect((await service.getAvailability(caregiverId.toString())).available).toBe(true);
  });
});
