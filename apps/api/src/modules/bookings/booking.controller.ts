import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateBookingDto,
  AdminCreateBookingDto,
  CancelBookingDto,
} from './dto/booking.dto';

@Controller('bookings')
export class BookingController {
  constructor(private bookingService: BookingService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createBooking(@Request() req: any, @Body() dto: CreateBookingDto) {
    return this.bookingService.createBooking(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin')
  adminCreateBooking(@Request() req: any, @Body() dto: AdminCreateBookingDto) {
    return this.bookingService.adminCreateBooking(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('player')
  getPlayerBookings(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.bookingService.getPlayerBookings(
      req.user.id,
      Number(page) || 1,
      Number(limit) || 20,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('arena/:arenaId')
  getArenaBookings(
    @Request() req: any,
    @Param('arenaId') arenaId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.bookingService.getArenaBookings(
      arenaId,
      req.user.id,
      Number(page) || 1,
      Number(limit) || 20,
      status,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getBookingById(@Request() req: any, @Param('id') id: string) {
    const userType = req.user.userType === 'PLAYER' ? 'player' : 'user';
    return this.bookingService.getBookingById(id, req.user.id, userType);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel')
  cancelBooking(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: CancelBookingDto,
  ) {
    const userType = req.user.userType === 'PLAYER' ? 'player' : 'user';
    return this.bookingService.cancelBooking(id, req.user.id, userType, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/complete')
  completeBooking(@Request() req: any, @Param('id') id: string) {
    return this.bookingService.completeBooking(id, req.user.id);
  }
}
