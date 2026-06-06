import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  InitiateRechargeDto,
  VerifyRechargeDto,
  WithdrawDto,
} from './dto/wallet.dto';

@Controller('wallet')
export class WalletController {
  constructor(private walletService: WalletService) {}

  @UseGuards(JwtAuthGuard)
  @Get('player')
  getPlayerWallet(@Request() req: any) {
    return this.walletService.getPlayerWallet(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin')
  getAdminWallet(@Request() req: any) {
    return this.walletService.getAdminWallet(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('transactions')
  getTransactions(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const requesterType = req.user.userType === 'PLAYER' ? 'player' : 'user';
    return this.walletService.getTransactions(
      req.user.id,
      requesterType,
      Number(page) || 1,
      Number(limit) || 20,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('recharge/initiate')
  initiateRecharge(@Request() req: any, @Body() dto: InitiateRechargeDto) {
    return this.walletService.initiateRecharge(req.user.id, dto);
  }

  @Post('recharge/verify')
  verifyRecharge(@Body() dto: VerifyRechargeDto) {
    return this.walletService.verifyAndCreditWallet(dto.orderId);
  }

  @Post('recharge/webhook')
  cashfreeWebhook(@Body() body: any) {
    const orderId = body?.data?.order?.order_id;
    if (orderId) {
      return this.walletService.verifyAndCreditWallet(orderId);
    }
    return { received: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post('withdraw')
  requestWithdrawal(@Request() req: any, @Body() dto: WithdrawDto) {
    return this.walletService.requestWithdrawal(req.user.id, dto);
  }
}
