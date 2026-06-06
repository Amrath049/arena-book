import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  getStats(@Request() req: any, @Query('arenaId') arenaId: string) {
    return this.dashboardService.getStats(req.user.id, arenaId);
  }
}
