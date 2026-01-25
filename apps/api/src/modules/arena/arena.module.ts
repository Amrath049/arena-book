import { Module } from '@nestjs/common';
import { ArenaController } from './arena.controller';
import { ArenaService } from './arena.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [PrismaModule, PassportModule],
  controllers: [ArenaController],
  providers: [ArenaService],
  exports: [ArenaService],
})
export class ArenaModule {}
