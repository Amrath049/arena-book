import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateArenaDto, UpdateArenaDto } from './dto/arena.details.dto';

@Injectable()
export class ArenaService {
  constructor(private prisma: PrismaService) {}

  async createArena(ownerId: string, createArenaDto: CreateArenaDto) {
    // Verify that the owner (User) exists
    const owner = await this.prisma.user.findUnique({
      where: { id: ownerId },
    });

    if (!owner) {
      throw new NotFoundException('Owner not found');
    }

    // Create the arena
    const arena = await this.prisma.arena.create({
      data: {
        ownerId,
        name: createArenaDto.name,
        description: createArenaDto.description,
        address: createArenaDto.address,
        city: createArenaDto.city,
        phone: createArenaDto.phone,
        email: createArenaDto.email,
        images: createArenaDto.images || [],
        terms: createArenaDto.terms,
        customMsg: createArenaDto.customMsg,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return {
      message: 'Arena created successfully',
      arena,
    };
  }

  async updateArena(
    arenaId: string,
    ownerId: string,
    updateArenaDto: UpdateArenaDto,
  ) {
    // Verify arena exists
    const arena = await this.prisma.arena.findUnique({
      where: { id: arenaId },
    });

    if (!arena) {
      throw new NotFoundException('Arena not found');
    }

    // Verify the requesting user is the owner (authorization)
    if (arena.ownerId !== ownerId) {
      throw new ForbiddenException(
        'You are not authorized to update this arena',
      );
    }

    // Update arena details
    const updatedArena = await this.prisma.arena.update({
      where: { id: arenaId },
      data: {
        ...updateArenaDto,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return {
      message: 'Arena updated successfully',
      arena: updatedArena,
    };
  }

  async getArenaById(arenaId: string) {
    const arena = await this.prisma.arena.findUnique({
      where: { id: arenaId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        gameTypes: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!arena) {
      throw new NotFoundException('Arena not found');
    }

    return arena;
  }

  async getArena(ownerId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: ownerId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const arena = await this.prisma.arena.findFirst({
      where: { ownerId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        gameTypes: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!arena) {
      return {
        id: '',
        ownerId: '',
        name: '',
        description: '',
        address: '',
        city: '',
        phone: '',
        email: '',
        latitude: null,
        longitude: null,
        images: [''],
        isActive: true,
        terms: '',
        customMsg: '',
        owner: {
          id: '',
          name: '',
          email: '',
          phone: '',
        },
        gameTypes: [],
      };
    }

    return arena;
  }

  async getArenasByOwner(ownerId: string) {
    const arenas = await this.prisma.arena.findMany({
      where: { ownerId },
      include: {
        gameTypes: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      count: arenas.length,
      arenas,
    };
  }
}
