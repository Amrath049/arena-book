import { IsString, IsNotEmpty, IsUUID, IsOptional, IsInt, Min, IsDateString } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  @IsNotEmpty()
  courtId: string;

  @IsUUID()
  @IsNotEmpty()
  arenaId: string;

  @IsDateString()
  @IsNotEmpty()
  date: string; // "2024-01-15"

  @IsString()
  @IsNotEmpty()
  startTime: string; // "06:00"

  @IsString()
  @IsNotEmpty()
  endTime: string; // "07:00"

  @IsInt()
  @Min(0)
  price: number;
}

export class AdminCreateBookingDto {
  @IsUUID()
  @IsNotEmpty()
  playerId: string;

  @IsUUID()
  @IsNotEmpty()
  courtId: string;

  @IsUUID()
  @IsNotEmpty()
  arenaId: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsNotEmpty()
  endTime: string;

  @IsInt()
  @Min(0)
  price: number;
}

export class CancelBookingDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
