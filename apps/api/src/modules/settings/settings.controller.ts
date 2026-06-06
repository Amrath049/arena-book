import {
  Controller,
  Get,
  Put,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SaveSettingsDto } from './dto/settings.dto';

type AuthenticatedRequest = ExpressRequest & { user: { id: string } };

@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getSettings(
    @Request() req: AuthenticatedRequest,
    @Query('arenaId') arenaId: string,
  ) {
    return this.settingsService.getSettings(req.user.id, arenaId);
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  saveSettings(
    @Request() req: AuthenticatedRequest,
    @Body() dto: SaveSettingsDto,
  ) {
    return this.settingsService.saveSettings(req.user.id, dto);
  }
}
