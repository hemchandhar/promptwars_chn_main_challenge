import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { CaregiversService } from './caregivers.service.js';
import { JwtAuthGuard } from '../common/jwt-auth.guard.js';
import { RolesGuard } from '../common/roles.guard.js';
import { Roles } from '../common/roles.decorator.js';
import { LinkIndividualDto } from './dto/link.dto.js';
import { SendEncouragementDto } from './dto/encouragement.dto.js';

@Controller('api/caregivers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('caregiver')
export class CaregiversController {
  constructor(private caregiversService: CaregiversService) {}

  @Post('link')
  async linkIndividual(@Req() req: any, @Body() body: LinkIndividualDto) {
    return this.caregiversService.linkIndividual(req.user.userId, body.individualId);
  }

  @Get('my-individuals')
  async myIndividuals(@Req() req: any) {
    return this.caregiversService.myIndividuals(req.user.userId);
  }

  @Get('supported/:individualId/activity')
  async getSupportedActivity(@Req() req: any, @Param('individualId') individualId: string) {
    return this.caregiversService.getSupportedActivity(req.user.userId, individualId);
  }

  @Get('supported/:individualId/risk-calendar')
  async getSupportedRiskCalendar(@Req() req: any, @Param('individualId') individualId: string) {
    return this.caregiversService.getSupportedRiskCalendar(req.user.userId, individualId);
  }

  @Post('send-encouragement')
  async sendEncouragement(@Req() req: any, @Body() body: SendEncouragementDto) {
    return this.caregiversService.sendEncouragement(req.user.userId, body.individualId, body.message);
  }

  @Get('polling/:individualId')
  async pollForAlerts(@Req() req: any, @Param('individualId') individualId: string) {
    return this.caregiversService.pollForAlerts(req.user.userId, individualId);
  }
}
