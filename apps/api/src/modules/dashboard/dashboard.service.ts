import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BOOKING_STATUS } from '../../common/constants/booking.constants';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(ownerId: string, arenaId: string) {
    const arena = await this.prisma.arena.findFirst({
      where: { id: arenaId, ownerId },
    });
    if (!arena) throw new ForbiddenException('Not your arena');

    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayBookings, upcomingCount, monthlyBookings, ownerWallet] =
      await Promise.all([
        this.prisma.booking.findMany({
          where: {
            arenaId,
            createdAt: { gte: todayStart, lt: todayEnd },
            status: BOOKING_STATUS.CONFIRMED,
          },
          include: {
            player: { select: { name: true, phone: true } },
            court: { include: { gameType: { select: { name: true } } } },
            slot: true,
          },
        }),
        this.prisma.booking.count({
          where: {
            arenaId,
            status: BOOKING_STATUS.CONFIRMED,
            slot: { date: { gte: now } },
          },
        }),
        this.prisma.booking.aggregate({
          where: {
            arenaId,
            status: {
              in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.COMPLETED],
            },
            createdAt: { gte: monthStart },
          },
          _sum: { price: true },
          _count: { id: true },
        }),
        this.prisma.user.findUnique({
          where: { id: ownerId },
          select: { walletBalance: true },
        }),
      ]);

    // Weekly revenue (last 7 days)
    const weeklyData = await this.getWeeklyRevenue(arenaId);

    return {
      todayBookings: {
        count: todayBookings.length,
        revenue: todayBookings.reduce((sum, b) => sum + b.price, 0),
        bookings: todayBookings,
      },
      upcomingCount,
      monthlyRevenue: monthlyBookings._sum.price ?? 0,
      monthlyBookingCount: monthlyBookings._count.id,
      walletBalance: ownerWallet?.walletBalance ?? 0,
      weeklyRevenue: weeklyData,
    };
  }

  private async getWeeklyRevenue(arenaId: string) {
    const days: { label: string; revenue: number; bookings: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const start = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      );
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

      const agg = await this.prisma.booking.aggregate({
        where: {
          arenaId,
          status: { in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.COMPLETED] },
          createdAt: { gte: start, lt: end },
        },
        _sum: { price: true },
        _count: { id: true },
      });

      days.push({
        label: start.toLocaleDateString('en-IN', { weekday: 'short' }),
        revenue: agg._sum.price ?? 0,
        bookings: agg._count.id,
      });
    }

    return days;
  }
}
