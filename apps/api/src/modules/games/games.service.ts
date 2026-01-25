import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateCourtDto,
  CreateGameDto,
  UpdateCourtDto,
  UpdateGameDto,
} from './dto/games.dto';

@Injectable()
export class GamesService {
  constructor(private prisma: PrismaService) {}

  // ============ GAME METHODS ============

  async createGame(ownerId: string, createGameDto: CreateGameDto) {
    const { arenaId, name } = createGameDto;

    // Verify arena exists and user owns it
    const arena = await this.prisma.arena.findUnique({
      where: { id: arenaId },
    });

    if (!arena) {
      throw new NotFoundException('Arena not found');
    }

    if (arena.ownerId !== ownerId) {
      throw new ForbiddenException(
        'You are not authorized to add games to this arena',
      );
    }

    const existingGame = await this.prisma.gameType.findFirst({
      where: { name, arenaId,isActive:true },
    });

    if (existingGame) {
      throw new ForbiddenException('Game already exists');
    }

    // Create game type
    const game = await this.prisma.gameType.create({
      data: {
        name,
        arenaId,
      },
      include: {
        _count: {
          select: { courts: true },
        },
      },
    });

    return {
      message: 'Game created successfully',
      game,
    };
  }

  async updateGame(
    gameId: string,
    ownerId: string,
    updateGameDto: UpdateGameDto,
  ) {
    // Verify game exists and user owns the arena
    const game = await this.prisma.gameType.findUnique({
      where: { id: gameId },
      include: {
        arena: true,
      },
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    if (game.arena.ownerId !== ownerId) {
      throw new ForbiddenException(
        'You are not authorized to update this game',
      );
    }

    const existingGame = await this.prisma.gameType.findFirst({
      where: { name: game.name, arenaId: game.arenaId,isActive:true },
    });

    if (existingGame && existingGame.id !== gameId) {
      throw new ForbiddenException('Game already exists');
    }

    // Update game
    const updatedGame = await this.prisma.gameType.update({
      where: { id: gameId },
      data: updateGameDto,
      include: {
        _count: {
          select: { courts: true },
        },
      },
    });

    return {
      message: 'Game updated successfully',
      game: updatedGame,
    };
  }

  async deleteGame(gameId: string, ownerId: string) {
    // Verify game exists and user owns the arena
    const game = await this.prisma.gameType.findUnique({
      where: { id: gameId,isActive:true },
      include: {
        arena: true,
      },
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    if (game.arena.ownerId !== ownerId) {
      throw new ForbiddenException(
        'You are not authorized to delete this game',
      );
    }

    // Soft delete - set isActive to false
    await this.prisma.gameType.update({
      where: { id: gameId },
      data: { isActive: false },
    });

    return {
      message: 'Game deleted successfully',
    };
  }

  async getGamesByArena(arenaId: string) {
    const games = await this.prisma.gameType.findMany({
      where: {
        arenaId,
        isActive: true,
      },
      include:{
        courts:{
          where:{
            isActive:true
          },
          select:{
            id:true,
            name:true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const count = await this.prisma.gameType.count({
      where: {
        arenaId,
        isActive: true,
      },
    });

    return {
      count,
      games,
    };
  }

  // ============ COURT METHODS ============

  async createCourt(ownerId: string, createCourtDto: CreateCourtDto) {
    const { gameTypeId, name } = createCourtDto;

    // Verify game type exists and user owns the arena
    const gameType = await this.prisma.gameType.findUnique({
      where: { id: gameTypeId },
      include: {
        arena: true,
      },
    });

    if (!gameType) {
      throw new NotFoundException('Game type not found');
    }

    if (gameType.arena.ownerId !== ownerId) {
      throw new ForbiddenException(
        'You are not authorized to add courts to this game',
      );
    }

    const existingCourt = await this.prisma.court.findFirst({
      where: { name, gameTypeId,isActive:true },
    });

    if (existingCourt) {
      throw new ForbiddenException('Court already exists');
    }

    // Create court
    const court = await this.prisma.court.create({
      data: {
        name,
        gameTypeId,
      },
    });

    return {
      message: 'Court created successfully',
      court,
    };
  }

  async updateCourt(
    courtId: string,
    ownerId: string,
    updateCourtDto: UpdateCourtDto,
  ) {
    // Verify court exists and user owns the arena
    const court = await this.prisma.court.findUnique({
      where: { id: courtId },
      include: {
        gameType: {
          include: {
            arena: true,
          },
        },
      },
    });

    if (!court) {
      throw new NotFoundException('Court not found');
    }

    if (court.gameType.arena.ownerId !== ownerId) {
      throw new ForbiddenException(
        'You are not authorized to update this court',
      );
    }

    const existingCourt = await this.prisma.court.findFirst({
      where: { name: court.name, gameTypeId: court.gameTypeId,isActive:true },
    });

    if (existingCourt && existingCourt.id !== courtId) {
      throw new ForbiddenException('Court already exists');
    }

    // Update court
    const updatedCourt = await this.prisma.court.update({
      where: { id: courtId },
      data: updateCourtDto,
    });

    return {
      message: 'Court updated successfully',
      court: updatedCourt,
    };
  }

  async deleteCourt(courtId: string, ownerId: string) {
    // Verify court exists and user owns the arena
    const court = await this.prisma.court.findUnique({
      where: { id: courtId,isActive:true },
      include: {
        gameType: {
          include: {
            arena: true,
          },
        },
      },
    });

    if (!court) {
      throw new NotFoundException('Court not found');
    }

    if (court.gameType.arena.ownerId !== ownerId) {
      throw new ForbiddenException(
        'You are not authorized to delete this court',
      );
    }

    // Soft delete - set isActive to false
    await this.prisma.court.update({
      where: { id: courtId },
      data: { isActive: false },
    });

    return {
      message: 'Court deleted successfully',
    };
  }

  async getCourtsByGame(gameTypeId: string) {
    const courts = await this.prisma.court.findMany({
      where: {
        gameTypeId,
        isActive: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return {
      count: courts.length,
      courts,
    };
  }
}
