import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health/health.controller';
import { AuthModule } from './modules/auth/auth.module';
import { ArenaModule } from './modules/arena/arena.module';
import { GamesModule } from './modules/games/games.module';
import { SlotModule } from './modules/slot/slot.module';
import { BookingModule } from './modules/bookings/booking.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { SettingsModule } from './modules/settings/settings.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { PlayerModule } from './modules/player/player.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ArenaModule,
    GamesModule,
    SlotModule,
    BookingModule,
    WalletModule,
    SettingsModule,
    DashboardModule,
    PlayerModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
