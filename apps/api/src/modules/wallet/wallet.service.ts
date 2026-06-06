import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { InitiateRechargeDto, WithdrawDto } from './dto/wallet.dto';
import {
  WALLET_TX_TYPE,
  WALLET_SOURCE,
} from '../../common/constants/booking.constants';

@Injectable()
export class WalletService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async getPlayerWallet(playerId: string) {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      select: { id: true, name: true, walletBalance: true },
    });
    if (!player) throw new NotFoundException('Player not found');
    return player;
  }

  async getAdminWallet(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, walletBalance: true },
    });
    if (!user) throw new NotFoundException('User not found');

    // Sum of all CONFIRMED booking prices across arenas owned by this user
    const holdResult = await this.prisma.booking.aggregate({
      where: {
        arena: { ownerId: userId },
        status: 'CONFIRMED',
      },
      _sum: { price: true },
      _count: { id: true },
    });

    return {
      ...user,
      holdAmount: holdResult._sum.price ?? 0,
      holdBookingsCount: holdResult._count.id,
    };
  }

  async getTransactions(
    requesterId: string,
    requesterType: 'player' | 'user',
    page = 1,
    limit = 20,
  ) {
    const where =
      requesterType === 'player'
        ? { playerId: requesterId }
        : { userId: requesterId };

    const [transactions, total] = await Promise.all([
      this.prisma.walletTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.walletTransaction.count({ where }),
    ]);

    return {
      transactions,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async initiateRecharge(playerId: string, dto: InitiateRechargeDto) {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      select: { id: true, name: true, email: true, phone: true },
    });
    if (!player) throw new NotFoundException('Player not found');

    const appId = this.config.get('CASHFREE_APP_ID');
    const secretKey = this.config.get('CASHFREE_SECRET_KEY');
    const environment = this.config.get('CASHFREE_ENV', 'TEST');

    const orderId = `order_${playerId.replace(/-/g, '').slice(0, 12)}_${Date.now()}`;
    const baseUrl = this.config.get(
      'CASHFREE_RETURN_URL',
      'http://localhost:5174',
    );

    const payload = {
      order_id: orderId,
      order_amount: dto.amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: playerId,
        customer_name: player.name ?? 'Player',
        customer_email: player.email ?? '',
        customer_phone: player.phone ?? '9999999999',
      },
      order_meta: {
        return_url: `${baseUrl}/payment/callback?order_id={order_id}`,
        notify_url: `${this.config.get('API_URL', 'http://localhost:3000')}/wallet/recharge/webhook`,
      },
    };

    const baseApiUrl =
      environment === 'PROD'
        ? 'https://api.cashfree.com/pg/orders'
        : 'https://sandbox.cashfree.com/pg/orders';

    const response = await fetch(baseApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': appId,
        'x-client-secret': secretKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new BadRequestException(`Cashfree error: ${err}`);
    }

    const order = await response.json();
    return {
      orderId: order.order_id,
      paymentSessionId: order.payment_session_id,
      amount: dto.amount,
    };
  }

  async verifyAndCreditWallet(orderId: string) {
    const appId = this.config.get('CASHFREE_APP_ID');
    const secretKey = this.config.get('CASHFREE_SECRET_KEY');
    const environment = this.config.get('CASHFREE_ENV', 'TEST');

    const baseApiUrl =
      environment === 'PROD'
        ? `https://api.cashfree.com/pg/orders/${orderId}`
        : `https://sandbox.cashfree.com/pg/orders/${orderId}`;

    const response = await fetch(baseApiUrl, {
      method: 'GET',
      headers: {
        'x-api-version': '2023-08-01',
        'x-client-id': appId,
        'x-client-secret': secretKey,
      },
    });

    if (!response.ok) throw new BadRequestException('Failed to verify payment');
    const order = await response.json();

    if (order.order_status !== 'PAID') {
      return { success: false, message: 'Payment not completed' };
    }

    // Extract playerId from order_id: "order_{playerId12chars}_{timestamp}"
    const parts = orderId.split('_');
    if (parts.length < 3)
      throw new BadRequestException('Invalid order ID format');

    // Check if already credited (idempotency)
    const existing = await this.prisma.walletTransaction.findFirst({
      where: { referenceId: orderId, source: WALLET_SOURCE.MANUAL },
    });
    if (existing)
      return {
        success: true,
        message: 'Already credited',
        alreadyProcessed: true,
      };

    // Find player by checking transactions or by matching order customer_id
    const playerId = order.customer_details?.customer_id;
    if (!playerId)
      throw new BadRequestException('Cannot identify player from order');

    const amount = Math.round(order.order_amount);

    await this.prisma.$transaction(async (tx) => {
      await tx.player.update({
        where: { id: playerId },
        data: { walletBalance: { increment: amount } },
      });

      await tx.walletTransaction.create({
        data: {
          playerId,
          amount,
          type: WALLET_TX_TYPE.CREDIT,
          source: WALLET_SOURCE.MANUAL,
          referenceId: orderId,
          reason: `Wallet recharge via Cashfree`,
        },
      });
    });

    return { success: true, message: 'Wallet credited', amount };
  }

  async requestWithdrawal(userId: string, dto: WithdrawDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.walletBalance < dto.amount) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { walletBalance: { decrement: dto.amount } },
      });

      const txRecord = await tx.walletTransaction.create({
        data: {
          userId,
          amount: dto.amount,
          type: WALLET_TX_TYPE.DEBIT,
          source: WALLET_SOURCE.WITHDRAWAL,
          reason: `Withdrawal to ${dto.accountType} account ending ${dto.accountNumber.slice(-4)}`,
          isAdmin: true,
        },
      });

      return {
        message: 'Withdrawal request submitted',
        transactionId: txRecord.id,
        amount: dto.amount,
      };
    });
  }
}
