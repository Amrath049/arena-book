// import { BadRequestException, Injectable } from '@nestjs/common';
// import { PrismaService } from '../../prisma/prisma.service';

import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class BookingService {
  constructor(
    private prisma: PrismaService,
  ) {}
}

