import { IsInt, IsNotEmpty, Min, Max, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CancellationRuleDto {
  @IsInt()
  @Min(0)
  hoursBeforeSlot: number;

  @IsInt()
  @Min(0)
  @Max(100)
  refundPercent: number;
}

export class SaveSettingsDto {
  @IsInt()
  @Min(0)
  bookingCloseMins: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CancellationRuleDto)
  cancellationRules: CancellationRuleDto[];

  @IsNotEmpty()
  arenaId: string;
}
