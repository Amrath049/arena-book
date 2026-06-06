import { IsString, IsOptional, Length, Matches } from 'class-validator';

export class UpdatePlayerProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @Length(10, 10)
  @Matches(/^[6-9]\d{9}$/, { message: 'Invalid Indian phone number' })
  phone?: string;
}
