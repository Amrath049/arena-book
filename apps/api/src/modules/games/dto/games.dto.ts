import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

// ============ GAME DTOs ============

export class CreateGameDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @IsNotEmpty()
  @IsUUID()
  arenaId: string;
}

export class UpdateGameDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ============ COURT DTOs ============

export class CreateCourtDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @IsNotEmpty()
  @IsUUID()
  gameTypeId: string;

  @IsOptional()
  @IsInt()
  @Min(15)
  slotDuration?: number;
}

export class UpdateCourtDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(15)
  slotDuration?: number;
}
