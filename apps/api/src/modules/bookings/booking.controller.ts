import { Body, Controller, Post, Req } from "@nestjs/common";
import { BookingService } from "./booking.service";

@Controller('bookings')
export class BookingController {
  constructor(private bookingService: BookingService) {}
}
