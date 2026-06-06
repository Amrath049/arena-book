import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SaveSettingsDto } from './dto/settings.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings(ownerId: string, arenaId: string) {
    const arena = await this.prisma.arena.findFirst({
      where: { id: arenaId, ownerId },
    });
    if (!arena) throw new ForbiddenException('Not your arena');

    const settings = await this.prisma.arenaSettings.findUnique({
      where: { arenaId },
      include: { cancellationRules: { orderBy: { hoursBeforeSlot: 'desc' } } },
    });

    return (
      settings ?? {
        arenaId,
        bookingCloseMins: 30,
        cancellationRules: [],
      }
    );
  }

  async saveSettings(ownerId: string, dto: SaveSettingsDto) {
    const arena = await this.prisma.arena.findFirst({
      where: { id: dto.arenaId, ownerId },
    });
    if (!arena) throw new ForbiddenException('Not your arena');

    const existing = await this.prisma.arenaSettings.findUnique({
      where: { arenaId: dto.arenaId },
    });

    if (existing) {
      // Delete old rules and recreate
      await this.prisma.cancellationRule.deleteMany({
        where: { arenaSettingsId: existing.id },
      });
      return this.prisma.arenaSettings.update({
        where: { arenaId: dto.arenaId },
        data: {
          bookingCloseMins: dto.bookingCloseMins,
          cancellationRules: {
            create: dto.cancellationRules,
          },
        },
        include: {
          cancellationRules: { orderBy: { hoursBeforeSlot: 'desc' } },
        },
      });
    }

    return this.prisma.arenaSettings.create({
      data: {
        arenaId: dto.arenaId,
        ownerId,
        bookingCloseMins: dto.bookingCloseMins,
        cancellationRules: {
          create: dto.cancellationRules,
        },
      },
      include: { cancellationRules: { orderBy: { hoursBeforeSlot: 'desc' } } },
    });
  }
}
