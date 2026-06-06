import { IsString, IsNotEmpty, IsUUID, IsOptional, IsInt, Min, Max, IsDateString, IsIn } from 'class-validator';
import { DAY_TYPES } from '../../../common/constants/booking.constants';

export class CreateSlotGroupDto {
  @IsUUID()
  @IsNotEmpty()
  courtId: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(Object.values(DAY_TYPES))
  dayType: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsDateString()
  date?: string;
}

export class UpdateSlotGroupDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @IsOptional()
  isActive?: boolean;
}

export class CreateSlotDefinitionDto {
  @IsString()
  @IsNotEmpty()
  startTime: string; // "06:00"

  @IsString()
  @IsNotEmpty()
  endTime: string; // "07:00"

  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;
}

export class UpdateSlotDefinitionDto {
  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;
}

export class BlockSlotDto {
  @IsUUID()
  @IsNotEmpty()
  courtId: string;

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
