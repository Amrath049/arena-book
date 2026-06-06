import { IsInt, IsNotEmpty, IsOptional, IsString, Min, Max, IsIn } from 'class-validator';

export class InitiateRechargeDto {
  @IsInt()
  @Min(10)
  @Max(100000)
  amount: number; // in rupees
}

export class VerifyRechargeDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;
}

export class WithdrawDto {
  @IsInt()
  @Min(1)
  amount: number;

  @IsString()
  @IsNotEmpty()
  accountHolderName: string;

  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @IsString()
  @IsNotEmpty()
  ifscCode: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['SAVINGS', 'CURRENT'])
  accountType: string;
}
