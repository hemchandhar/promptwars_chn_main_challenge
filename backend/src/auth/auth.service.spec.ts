import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service.js';
import { makeMockMongoService } from '../test-utils/mock-mongo.js';

describe('AuthService', () => {
  let service: AuthService;
  let mongo: ReturnType<typeof makeMockMongoService>;
  let jwt: JwtService;

  beforeEach(() => {
    mongo = makeMockMongoService();
    jwt = new JwtService({ secret: 'test-secret' });
    service = new AuthService(mongo as any, jwt);
  });

  describe('signup', () => {
    it('creates a user with a hashed password and returns a token', async () => {
      const res = await service.signup('new@example.com', 'password123', 'individual');
      expect(res.token).toBeDefined();
      expect(res.email).toBe('new@example.com');
      expect(res.role).toBe('individual');

      const stored = mongo.db.collection('users')._docs().find((u: any) => u.email === 'new@example.com');
      expect(stored.password).not.toBe('password123');
      expect(await bcrypt.compare('password123', stored.password)).toBe(true);
      expect(stored.privacyAccepted).toBe(false);
    });

    it('rejects a duplicate email', async () => {
      await service.signup('dup@example.com', 'password123', 'individual');
      await expect(service.signup('dup@example.com', 'password123', 'individual')).rejects.toThrow(BadRequestException);
    });

    it('rejects an invalid role', async () => {
      await expect(service.signup('x@example.com', 'password123', 'admin' as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('logs in with correct credentials', async () => {
      await service.signup('login@example.com', 'password123', 'caregiver');
      const res = await service.login('login@example.com', 'password123');
      expect(res.token).toBeDefined();
      expect(res.role).toBe('caregiver');
    });

    it('rejects the wrong password', async () => {
      await service.signup('wrongpw@example.com', 'password123', 'individual');
      await expect(service.login('wrongpw@example.com', 'nope')).rejects.toThrow(UnauthorizedException);
    });

    it('rejects an unknown email', async () => {
      await expect(service.login('ghost@example.com', 'whatever')).rejects.toThrow(NotFoundException);
    });

    it('rejects logging in as the wrong role', async () => {
      await service.signup('roled@example.com', 'password123', 'individual');
      await expect(service.login('roled@example.com', 'password123', 'caregiver')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('acceptPrivacyPolicy', () => {
    it('sets privacyAccepted when accepted', async () => {
      const signup = await service.signup('priv@example.com', 'password123', 'individual');
      await service.acceptPrivacyPolicy(signup.userId, true);
      const stored = mongo.db.collection('users')._docs().find((u: any) => u.email === 'priv@example.com');
      expect(stored.privacyAccepted).toBe(true);
    });

    it('deletes the account when declined', async () => {
      const signup = await service.signup('decline@example.com', 'password123', 'individual');
      const res = await service.acceptPrivacyPolicy(signup.userId, false);
      expect(res.deleted).toBe(true);
      const stored = mongo.db.collection('users')._docs().find((u: any) => u.email === 'decline@example.com');
      expect(stored).toBeUndefined();
    });
  });
});
