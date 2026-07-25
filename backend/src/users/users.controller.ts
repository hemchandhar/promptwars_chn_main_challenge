import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { JwtAuthGuard } from '../common/jwt-auth.guard.js';
import { RolesGuard } from '../common/roles.guard.js';
import { Roles } from '../common/roles.decorator.js';
import { OnboardingDto } from './dto/onboarding.dto.js';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('me/onboarding')
  async saveOnboarding(@Req() req: any, @Body() body: OnboardingDto) {
    return this.usersService.saveOnboarding(req.user.userId, body);
  }

  @Get('lookup')
  @UseGuards(RolesGuard)
  @Roles('caregiver')
  async lookup(@Query('email') email: string) {
    return this.usersService.lookupByEmail(email);
  }
}
