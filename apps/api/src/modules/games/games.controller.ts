import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  CreateCourtDto,
  CreateGameDto,
  UpdateCourtDto,
  UpdateGameDto,
} from './dto/games.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GamesService } from './games.service';

@Controller('games')
export class GamesController {
  constructor(private gamesService: GamesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createGame(@Request() req: any, @Body() dto: CreateGameDto) {
    return this.gamesService.createGame(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updateGame(
    @Param('id') gameId: string,
    @Request() req: any,
    @Body() dto: UpdateGameDto,
  ) {
    return this.gamesService.updateGame(gameId, req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteGame(@Param('id') gameId: string, @Request() req: any) {
    return this.gamesService.deleteGame(gameId, req.user.id);
  }

  @Get('arena/:arenaId')
  getGamesByArena(@Param('arenaId') arenaId: string) {
    return this.gamesService.getGamesByArena(arenaId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('courts')
  createCourt(@Request() req: any, @Body() dto: CreateCourtDto) {
    return this.gamesService.createCourt(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('courts/:id')
  updateCourt(
    @Param('id') courtId: string,
    @Request() req: any,
    @Body() dto: UpdateCourtDto,
  ) {
    return this.gamesService.updateCourt(courtId, req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('courts/:id')
  deleteCourt(@Param('id') courtId: string, @Request() req: any) {
    return this.gamesService.deleteCourt(courtId, req.user.id);
  }

  @Get('courts/game/:gameId')
  getCourtsByGame(@Param('gameId') gameTypeId: string) {
    return this.gamesService.getCourtsByGame(gameTypeId);
  }
}
