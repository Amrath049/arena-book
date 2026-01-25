import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { ArenaService } from './arena.service';
import { CreateArenaDto, UpdateArenaDto } from './dto/arena.details.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('arena')
export class ArenaController {
  constructor(private arenaService: ArenaService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createArena(@Request() req, @Body() createArenaDto: CreateArenaDto, @Response() res) {
    try {
      const ownerId = req.user.id; // Extract user ID from JWT token
      const response = await this.arenaService.createArena(ownerId, createArenaDto);
      return res.status(HttpStatus.OK).json({data: response});
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateArena(
    @Param('id') arenaId: string,
    @Request() req,
    @Body() updateArenaDto: UpdateArenaDto,
    @Response() res,
  ) {
    try {
      const ownerId = req.user.id; // Extract user ID from JWT token
      const response = await this.arenaService.updateArena(arenaId, ownerId, updateArenaDto);
      return res.status(HttpStatus.OK).json({data: response});
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getArena(@Request() req, @Response() res) {
    try {
      const ownerId = req.user.id;
      const response = await this.arenaService.getArena(ownerId);
      return res.status(HttpStatus.OK).json({data: response});
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

   @Get(':id')
  async getArenaById(@Param('id') arenaId: string, @Response() res) {
    try {
      const response = await this.arenaService.getArenaById(arenaId);
      return res.status(HttpStatus.OK).json({data: response});
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @Get('owner/my-arenas')
  @UseGuards(JwtAuthGuard)
  async getMyArenas(
    @Request() req,
    @Response() res,
  ) {
    try {
      const ownerId = req.user.id;
      const response = await this.arenaService.getArenasByOwner(ownerId);
      return res.status(HttpStatus.OK).json({data: response});
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
