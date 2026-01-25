import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { GamesService } from './games.service';
import {
  CreateCourtDto,
  CreateGameDto,
  UpdateCourtDto,
  UpdateGameDto,
} from './dto/games.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('games')
export class GamesController {
  constructor(private gamesService: GamesService) {}

  // ============ GAME ENDPOINTS ============

  @Post()
  @UseGuards(JwtAuthGuard)
  async createGame(
    @Request() req,
    @Body() createGameDto: CreateGameDto,
    @Response() res,
  ) {
    try {
      const ownerId = req.user.id;
      const response = await this.gamesService.createGame(
        ownerId,
        createGameDto,
      );
      return res.status(HttpStatus.CREATED).json({ data: response });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateGame(
    @Param('id') gameId: string,
    @Request() req,
    @Body() updateGameDto: UpdateGameDto,
    @Response() res,
  ) {
    try {
      const ownerId = req.user.id;
      const response = await this.gamesService.updateGame(
        gameId,
        ownerId,
        updateGameDto,
      );
      return res.status(HttpStatus.OK).json({ data: response });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteGame(
    @Param('id') gameId: string,
    @Request() req,
    @Response() res,
  ) {
    try {
      const ownerId = req.user.id;
      const response = await this.gamesService.deleteGame(gameId, ownerId);
      return res.status(HttpStatus.OK).json({ data: response });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @Get('arena/:arenaId')
  async getGamesByArena(@Param('arenaId') arenaId: string, @Response() res) {
    try {
      const response = await this.gamesService.getGamesByArena(arenaId);
      return res.status(HttpStatus.OK).json({ data: response });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // ============ COURT ENDPOINTS ============

  @Post('courts')
  @UseGuards(JwtAuthGuard)
  async createCourt(
    @Request() req,
    @Body() createCourtDto: CreateCourtDto,
    @Response() res,
  ) {
    try {
      const ownerId = req.user.id;
      const response = await this.gamesService.createCourt(
        ownerId,
        createCourtDto,
      );
      return res.status(HttpStatus.CREATED).json({ data: response });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @Patch('courts/:id')
  @UseGuards(JwtAuthGuard)
  async updateCourt(
    @Param('id') courtId: string,
    @Request() req,
    @Body() updateCourtDto: UpdateCourtDto,
    @Response() res,
  ) {
    try {
      const ownerId = req.user.id;
      const response = await this.gamesService.updateCourt(
        courtId,
        ownerId,
        updateCourtDto,
      );
      return res.status(HttpStatus.OK).json({ data: response });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @Delete('courts/:id')
  @UseGuards(JwtAuthGuard)
  async deleteCourt(
    @Param('id') courtId: string,
    @Request() req,
    @Response() res,
  ) {
    try {
      const ownerId = req.user.id;
      const response = await this.gamesService.deleteCourt(courtId, ownerId);
      return res.status(HttpStatus.OK).json({ data: response });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @Get('courts/game/:gameId')
  async getCourtsByGame(@Param('gameId') gameTypeId: string, @Response() res) {
    try {
      const response = await this.gamesService.getCourtsByGame(gameTypeId);
      return res.status(HttpStatus.OK).json({ data: response });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
