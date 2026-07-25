import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from '../common/jwt-auth.guard.js';
import { SignupDto } from './dto/signup.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { PrivacyAcceptanceDto } from './dto/privacy.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async signup(@Body() body: SignupDto) {
    return this.authService.signup(body.email, body.password, body.role);
  }

  @Post('privacy-acceptance')
  @UseGuards(JwtAuthGuard)
  async acceptPrivacy(@Req() req: any, @Body() body: PrivacyAcceptanceDto) {
    return this.authService.acceptPrivacyPolicy(req.user.userId, body.accepted);
  }

  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password, body.role);
  }
}
