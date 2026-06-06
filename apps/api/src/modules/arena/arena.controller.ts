import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ArenaService } from './arena.service';
import { CreateArenaDto, UpdateArenaDto } from './dto/arena.details.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('arena')
export class ArenaController {
  constructor(private arenaService: ArenaService) {}

  // Public endpoints
  @Get('public')
  listPublicArenas(
    @Query('city') city?: string,
    @Query('sport') sport?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.arenaService.listPublicArenas(city, sport, Number(page) || 1, Number(limit) || 20);
  }

  @Get('public/:id')
  getPublicArenaDetail(@Param('id') arenaId: string) {
    return this.arenaService.getPublicArenaDetail(arenaId);
  }

  // Admin endpoints
  @UseGuards(JwtAuthGuard)
  @Post()
  createArena(@Request() req: any, @Body() createArenaDto: CreateArenaDto) {
    return this.arenaService.createArena(req.user.id, createArenaDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updateArena(@Param('id') arenaId: string, @Request() req: any, @Body() updateArenaDto: UpdateArenaDto) {
    return this.arenaService.updateArena(arenaId, req.user.id, updateArenaDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getArena(@Request() req: any) {
    return this.arenaService.getArena(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('owner/my-arenas')
  getMyArenas(@Request() req: any) {
    return this.arenaService.getArenasByOwner(req.user.id);
  }

  @Get(':id')
  getArenaById(@Param('id') arenaId: string) {
    return this.arenaService.getArenaById(arenaId);
  }
}
