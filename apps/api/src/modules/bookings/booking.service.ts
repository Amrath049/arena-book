import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../common/services/redis.service';
import {
  CreateBookingDto,
  AdminCreateBookingDto,
  CancelBookingDto,
} from './dto/booking.dto';
import {
  SLOT_STATUS,
  BOOKING_STATUS,
  WALLET_TX_TYPE,
  WALLET_SOURCE,
} from '../../common/constants/booking.constants';

function rethrowConflict(error: unknown): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  ) {
    throw new ConflictException(
      'This slot was just booked by someone else. Please select a different slot.',
    );
  }
  throw error;
}

@Injectable()
export class BookingService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async createBooking(playerId: string, dto: CreateBookingDto) {
    const slotDate = new Date(dto.date + 'T00:00:00.000Z');

    try {
      return await this.prisma.$transaction(async (tx) => {
        const existingSlot = await tx.slot.findFirst({
          where: {
            courtId: dto.courtId,
            date: slotDate,
            startTime: dto.startTime,
          },
        });

        if (existingSlot && existingSlot.status !== SLOT_STATUS.AVAILABLE) {
          throw new ConflictException('Slot is not available');
        }

        const player = await tx.player.findUnique({ where: { id: playerId } });
        if (!player) throw new NotFoundException('Player not found');
        if (player.walletBalance < dto.price) {
          throw new BadRequestException('Insufficient wallet balance');
        }

        let slotId: string;
        if (existingSlot) {
          // Optimistic lock: only update if still AVAILABLE — prevents race condition
          const updated = await tx.slot.updateMany({
            where: { id: existingSlot.id, status: SLOT_STATUS.AVAILABLE },
            data: { status: SLOT_STATUS.BOOKED },
          });
          if (updated.count === 0) {
            throw new ConflictException(
              'This slot was just booked by someone else. Please select a different slot.',
            );
          }
          slotId = existingSlot.id;
        } else {
          const slot = await tx.slot.create({
            data: {
              courtId: dto.courtId,
              date: slotDate,
              startTime: dto.startTime,
              endTime: dto.endTime,
              price: dto.price,
              status: SLOT_STATUS.BOOKED,
            },
          });
          slotId = slot.id;
        }

        const booking = await tx.booking.create({
          data: {
            playerId,
            arenaId: dto.arenaId,
            slotId,
            courtId: dto.courtId,
            price: dto.price,
            status: BOOKING_STATUS.CONFIRMED,
          },
          include: {
            slot: true,
            arena: { select: { id: true, name: true, address: true } },
            court: { include: { gameType: { select: { name: true } } } },
            player: {
              select: { id: true, name: true, email: true, phone: true },
            },
          },
        });

        await tx.player.update({
          where: { id: playerId },
          data: { walletBalance: { decrement: dto.price } },
        });

        await tx.walletTransaction.create({
          data: {
            playerId,
            amount: dto.price,
            type: WALLET_TX_TYPE.DEBIT,
            source: WALLET_SOURCE.BOOKING,
            referenceId: booking.id,
            reason: `Booking at ${booking.arena.name}`,
          },
        });

        await this.redis.del(`slots:available:court_${dto.courtId}:date_${dto.date}`);

        return booking;
      });
    } catch (error) {
      rethrowConflict(error);
    }
  }

  async adminCreateBooking(ownerId: string, dto: AdminCreateBookingDto) {
    const arena = await this.prisma.arena.findFirst({
      where: { id: dto.arenaId, ownerId },
    });
    if (!arena) throw new ForbiddenException('Not your arena');

    const slotDate = new Date(dto.date + 'T00:00:00.000Z');

    try {
      return await this.prisma.$transaction(async (tx) => {
        const existingSlot = await tx.slot.findFirst({
          where: {
            courtId: dto.courtId,
            date: slotDate,
            startTime: dto.startTime,
          },
        });

        if (existingSlot && existingSlot.status !== SLOT_STATUS.AVAILABLE) {
          throw new ConflictException('Slot is not available');
        }

        let slotId: string;
        if (existingSlot) {
          const updated = await tx.slot.updateMany({
            where: { id: existingSlot.id, status: SLOT_STATUS.AVAILABLE },
            data: { status: SLOT_STATUS.BOOKED },
          });
          if (updated.count === 0) {
            throw new ConflictException(
              'This slot was just booked by someone else. Please select a different slot.',
            );
          }
          slotId = existingSlot.id;
        } else {
          const slot = await tx.slot.create({
            data: {
              courtId: dto.courtId,
              date: slotDate,
              startTime: dto.startTime,
              endTime: dto.endTime,
              price: dto.price,
              status: SLOT_STATUS.BOOKED,
            },
          });
          slotId = slot.id;
        }

        const booking = await tx.booking.create({
          data: {
            playerId: dto.playerId,
            arenaId: dto.arenaId,
            slotId,
            courtId: dto.courtId,
            price: dto.price,
            status: BOOKING_STATUS.CONFIRMED,
          },
          include: {
            slot: true,
            arena: { select: { id: true, name: true } },
            court: { include: { gameType: { select: { name: true } } } },
            player: {
              select: { id: true, name: true, email: true, phone: true },
            },
          },
        });

        const player = await tx.player.findUnique({
          where: { id: dto.playerId },
        });
        if (!player) throw new NotFoundException('Player not found');
        if (player.walletBalance < dto.price) {
          throw new BadRequestException(
            'Player has insufficient wallet balance',
          );
        }

        await tx.player.update({
          where: { id: dto.playerId },
          data: { walletBalance: { decrement: dto.price } },
        });

        await tx.walletTransaction.create({
          data: {
            playerId: dto.playerId,
            amount: dto.price,
            type: WALLET_TX_TYPE.DEBIT,
            source: WALLET_SOURCE.BOOKING,
            referenceId: booking.id,
            reason: `Admin booking at ${arena.name}`,
          },
        });

        await this.redis.del(`slots:available:court_${dto.courtId}:date_${dto.date}`);

        return booking;
      });
    } catch (error) {
      rethrowConflict(error);
    }
  }

  async getArenaBookings(
    arenaId: string,
    ownerId: string,
    page = 1,
    limit = 20,
    status?: string,
  ) {
    const arena = await this.prisma.arena.findFirst({
      where: { id: arenaId, ownerId },
    });
    if (!arena) throw new ForbiddenException('Not your arena');

    const where: any = { arenaId };
    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          slot: true,
          court: { include: { gameType: { select: { name: true } } } },
          player: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.booking.count({ where }),
    ]);

    return { bookings, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async getPlayerBookings(playerId: string, page = 1, limit = 20) {
    const where = { playerId };
    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          slot: true,
          arena: {
            select: {
              id: true,
              name: true,
              address: true,
              city: true,
              images: true,
            },
          },
          court: { include: { gameType: { select: { name: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.booking.count({ where }),
    ]);

    return { bookings, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async getBookingById(
    bookingId: string,
    requesterId: string,
    requesterType: 'player' | 'user',
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        slot: true,
        arena: true,
        court: { include: { gameType: true } },
        player: { select: { id: true, name: true, email: true, phone: true } },
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    if (requesterType === 'player' && booking.playerId !== requesterId) {
      throw new ForbiddenException('Not your booking');
    }
    if (requesterType === 'user') {
      const arena = await this.prisma.arena.findFirst({
        where: { id: booking.arenaId, ownerId: requesterId },
      });
      if (!arena) throw new ForbiddenException('Not your arena');
    }

    return booking;
  }

  async cancelBooking(
    bookingId: string,
    requesterId: string,
    requesterType: 'player' | 'user',
    dto: CancelBookingDto,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        slot: true,
        arena: {
          include: { arenaSettings: { include: { cancellationRules: true } } },
        },
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    if (requesterType === 'player' && booking.playerId !== requesterId) {
      throw new ForbiddenException('Not your booking');
    }
    if (requesterType === 'user') {
      const arena = await this.prisma.arena.findFirst({
        where: { id: booking.arenaId, ownerId: requesterId },
      });
      if (!arena) throw new ForbiddenException('Not your arena');
    }

    if (booking.status !== BOOKING_STATUS.CONFIRMED) {
      throw new BadRequestException('Booking cannot be cancelled');
    }

    const slotDateTime = new Date(
      `${booking.slot.date.toISOString().split('T')[0]}T${booking.slot.startTime}:00.000+05:30`,
    );
    const hoursUntilSlot =
      (slotDateTime.getTime() - Date.now()) / (1000 * 60 * 60);

    const rules = booking.arena.arenaSettings?.cancellationRules ?? [];
    let refundPercent: number;
    if (rules.length === 0) {
      refundPercent = 100;
    } else {
      refundPercent = 0;
      const sortedRules = [...rules].sort(
        (a, b) => b.hoursBeforeSlot - a.hoursBeforeSlot,
      );
      for (const rule of sortedRules) {
        if (hoursUntilSlot >= rule.hoursBeforeSlot) {
          refundPercent = rule.refundPercent;
          break;
        }
      }
    }

    const refundAmount = Math.floor((booking.price * refundPercent) / 100);

    return this.prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: BOOKING_STATUS.CANCELLED, reason: dto.reason },
      });

      await tx.slot.update({
        where: { id: booking.slotId },
        data: { status: SLOT_STATUS.AVAILABLE },
      });

      if (refundAmount > 0) {
        await tx.player.update({
          where: { id: booking.playerId },
          data: { walletBalance: { increment: refundAmount } },
        });

        await tx.walletTransaction.create({
          data: {
            playerId: booking.playerId,
            amount: refundAmount,
            type: WALLET_TX_TYPE.CREDIT,
            source: WALLET_SOURCE.REFUND,
            referenceId: bookingId,
            reason: `Refund for booking cancellation (${refundPercent}% of ₹${booking.price})`,
          },
        });
      }

      const slotDateStr = booking.slot.date.toISOString().split('T')[0];
      await this.redis.del(`slots:available:court_${booking.courtId}:date_${slotDateStr}`);

      return { message: 'Booking cancelled', refundAmount, refundPercent };
    });
  }

  async completeBooking(bookingId: string, ownerId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { arena: true, slot: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.arena.ownerId !== ownerId)
      throw new ForbiddenException('Not your arena');
    if (booking.status !== BOOKING_STATUS.CONFIRMED) {
      throw new BadRequestException(
        `Booking is already ${booking.status.toLowerCase()}`,
      );
    }

    const slotDate = booking.slot.date.toISOString().split('T')[0];
    const slotEndDateTime = new Date(
      `${slotDate}T${booking.slot.endTime}:00.000+05:30`,
    );
    if (new Date() < slotEndDateTime) {
      throw new BadRequestException(
        `Booking can only be completed after the slot ends at ${booking.slot.endTime} IST`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: BOOKING_STATUS.COMPLETED },
      });

      await tx.user.update({
        where: { id: ownerId },
        data: { walletBalance: { increment: booking.price } },
      });

      await tx.walletTransaction.create({
        data: {
          userId: ownerId,
          amount: booking.price,
          type: WALLET_TX_TYPE.CREDIT,
          source: WALLET_SOURCE.SETTLEMENT,
          referenceId: bookingId,
          reason: `Settlement – ${booking.slot.date.toISOString().split('T')[0]} ${booking.slot.startTime}`,
          isAdmin: true,
        },
      });

      return {
        message: 'Booking completed and settled to wallet',
        amount: booking.price,
      };
    });
  }
}
