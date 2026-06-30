import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdatePlayerProfileDto } from './dto/player.dto';

@Injectable()
export class PlayerService {
  constructor(private prisma: PrismaService) {}

  async getProfile(playerId: string) {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        walletBalance: true,
        createdAt: true,
        _count: { select: { bookings: true, favourites: true } },
      },
    });
    if (!player) throw new NotFoundException('Player not found');
    return player;
  }

  async updateProfile(playerId: string, dto: UpdatePlayerProfileDto) {
    return this.prisma.player.update({
      where: { id: playerId },
      data: dto,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        walletBalance: true,
      },
    });
  }

  async getFavourites(playerId: string) {
    return this.prisma.favouriteArena.findMany({
      where: { playerId },
      include: {
        arena: {
          include: {
            gameTypes: {
              where: { isActive: true },
              select: { name: true },
            },
          },
        },
      },
    });
  }

  async joinArena(playerId: string, arenaId: string) {
    const arena = await this.prisma.arena.findUnique({ where: { id: arenaId } });
    if (!arena) throw new NotFoundException('Arena not found');

    return this.prisma.favouriteArena.upsert({
      where: { playerId_arenaId: { playerId, arenaId } },
      create: { playerId, arenaId },
      update: {},
    });
  }

  async leaveArena(playerId: string, arenaId: string) {
    await this.prisma.favouriteArena.deleteMany({ where: { playerId, arenaId } });
    return { message: 'Arena removed from favourites' };
  }

  async getPlayers(ownerId: string, search?: string, page = 1, limit = 20) {
    const where: any = {
      bookings: {
        some: {
          arena: { ownerId },
        },
      },
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [players, total] = await Promise.all([
      this.prisma.player.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          walletBalance: true,
          createdAt: true,
          _count: { select: { bookings: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.player.count({ where }),
    ]);

    return { players, total, page, limit, pages: Math.ceil(total / limit) };
  }
}
