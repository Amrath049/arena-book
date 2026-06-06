import { Controller, Get, Patch, Post, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { PlayerService } from './player.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdatePlayerProfileDto } from './dto/player.dto';

@Controller('player')
export class PlayerController {
  constructor(private playerService: PlayerService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return this.playerService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(@Request() req: any, @Body() dto: UpdatePlayerProfileDto) {
    return this.playerService.updateProfile(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('arenas')
  getFavourites(@Request() req: any) {
    return this.playerService.getFavourites(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('arenas/:arenaId/join')
  joinArena(@Request() req: any, @Param('arenaId') arenaId: string) {
    return this.playerService.joinArena(req.user.id, arenaId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('arenas/:arenaId')
  leaveArena(@Request() req: any, @Param('arenaId') arenaId: string) {
    return this.playerService.leaveArena(req.user.id, arenaId);
  }

  // Admin endpoint to list/search players
  @UseGuards(JwtAuthGuard)
  @Get('list')
  getPlayers(
    @Request() req: any,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.playerService.getPlayers(req.user.id, search, Number(page) || 1, Number(limit) || 20);
  }
}
