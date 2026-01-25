import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
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
}

export class UpdateCourtDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
