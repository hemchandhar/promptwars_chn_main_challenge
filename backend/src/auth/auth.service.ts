import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';
import { MongoService } from '../common/mongo.service.js';

@Injectable()
export class AuthService {
  constructor(
    private mongo: MongoService,
    private jwtService: JwtService,
  ) {}

  private get users() {
    return this.mongo.db.collection('users');
  }

  async signup(email: string, password: string, role: 'individual' | 'caregiver') {
    if (!email || !password || !role) {
      throw new BadRequestException('email, password and role are required');
    }
    if (!['individual', 'caregiver'].includes(role)) {
      throw new BadRequestException('role must be individual or caregiver');
    }

    const existing = await this.users.findOne({ email });
    if (existing) {
      throw new BadRequestException('An account with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      email,
      password: hashedPassword,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      privacyAccepted: false,
      triggers: [] as string[],
      copingStrategies: [] as string[],
      supportNetwork: [] as string[],
      aiTrainingDay: 1,
      supportingUsers: [] as ObjectId[],
    };

    const result = await this.users.insertOne(user);
    const token = this.jwtService.sign({ userId: result.insertedId.toString(), role });

    return {
      token,
      userId: result.insertedId.toString(),
      email,
      role,
      message: 'Redirect to Privacy Policy Acceptance',
    };
  }

  async acceptPrivacyPolicy(userId: string, accepted: boolean) {
    const _id = new ObjectId(userId);
    if (!accepted) {
      await this.users.deleteOne({ _id });
      return { message: 'Account deleted', deleted: true };
    }

    await this.users.updateOne(
      { _id },
      { $set: { privacyAccepted: true, privacyAcceptedAt: new Date(), updatedAt: new Date() } },
    );

    return { message: 'Privacy policy accepted. Proceed to onboarding.' };
  }

  async login(email: string, password: string, role?: string) {
    const user = await this.users.findOne({ email });
    if (!user) throw new NotFoundException('User not found');
    if (role && user.role !== role) {
      throw new UnauthorizedException(`No ${role} account found for this email`);
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid password');

    const token = this.jwtService.sign({ userId: user._id.toString(), role: user.role });

    return {
      token,
      role: user.role,
      userId: user._id.toString(),
      aiTrainingDay: user.aiTrainingDay || 1,
    };
  }
}
