// auth/otp.service.ts
import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OtpService {
  private readonly OTP_EXPIRY_MINUTES = 10;
  private readonly MAX_ATTEMPTS = 5;
  private readonly RATE_LIMIT_WINDOW = 60;

  constructor(private prisma: PrismaService) {}

  private generateSecureOtp(digits: number): string {
    if (digits < 4 || digits > 8) {
      throw new BadRequestException('OTP length must be between 4 and 8 digits');
    }

    const max = Math.pow(10, digits);
    const min = Math.pow(10, digits - 1);
    const otp = crypto.randomInt(min, max);
    
    return otp.toString().padStart(digits, '0');
  }

  private async hashOtp(otp: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(otp, saltRounds);
  }

  /**
   * Generate and save OTP for Player
   */
  async generateAndSaveOtpForPlayer(
    playerId: string,
    email: string,
    digits: number = 6,
  ): Promise<{ otp: string; expiresAt: Date }> {
    // Rate limiting check
    const recentOtp = await this.prisma.otp.findFirst({
      where: {
        playerId,
        createdAt: {
          gte: new Date(Date.now() - this.RATE_LIMIT_WINDOW * 1000),
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (recentOtp) {
      const timeRemaining = Math.ceil(
        (this.RATE_LIMIT_WINDOW * 1000 - (Date.now() - recentOtp.createdAt.getTime())) / 1000,
      );
      throw new BadRequestException(
        `Please wait ${timeRemaining} seconds before requesting a new OTP`,
      );
    }

    // Invalidate all previous OTPs for this player
    await this.prisma.otp.updateMany({
      where: {
        playerId,
        verified: false,
      },
      data: {
        verified: true,
      },
    });

    // Generate OTP
    const otp = this.generateSecureOtp(digits);
    const otpHash = await this.hashOtp(otp);
    const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

    // Save hashed OTP
    await this.prisma.otp.create({
      data: {
        playerId,
        email,
        otpHash,
        userType: 'PLAYER',
        expiresAt,
      },
    });

    return { otp, expiresAt };
  }

  /**
   * Generate and save OTP for User (Admin)
   */
  async generateAndSaveOtpForUser(
    userId: string,
    email: string,
    digits: number = 8,
  ): Promise<{ otp: string; expiresAt: Date }> {
    // Rate limiting check
    const recentOtp = await this.prisma.otp.findFirst({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - this.RATE_LIMIT_WINDOW * 1000),
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (recentOtp) {
      const timeRemaining = Math.ceil(
        (this.RATE_LIMIT_WINDOW * 1000 - (Date.now() - recentOtp.createdAt.getTime())) / 1000,
      );
      throw new BadRequestException(
        `Please wait ${timeRemaining} seconds before requesting a new OTP`,
      );
    }

    // Invalidate all previous OTPs for this user
    await this.prisma.otp.updateMany({
      where: {
        userId,
        verified: false,
      },
      data: {
        verified: true,
      },
    });

    // Generate OTP
    const otp = this.generateSecureOtp(digits);
    const otpHash = await this.hashOtp(otp);
    const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

    // Save hashed OTP
    await this.prisma.otp.create({
      data: {
        userId,
        email,
        otpHash,
        userType: 'USER',
        expiresAt,
      },
    });

    return { otp, expiresAt };
  }

  /**
   * Verify OTP for Player
   */
  async verifyOtpForPlayer(playerId: string, otp: string): Promise<boolean> {
    const otpRecord = await this.prisma.otp.findFirst({
      where: {
        playerId,
        verified: false,
        expiresAt: {
          gte: new Date(),
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Check attempt limit
    if (otpRecord.attempts >= this.MAX_ATTEMPTS) {
      await this.prisma.otp.update({
        where: { id: otpRecord.id },
        data: { verified: true },
      });
      throw new UnauthorizedException(
        'Maximum verification attempts exceeded. Please request a new OTP',
      );
    }

    // Increment attempt counter
    await this.prisma.otp.update({
      where: { id: otpRecord.id },
      data: { attempts: otpRecord.attempts + 1 },
    });

    // Verify OTP
    const isValid = await bcrypt.compare(otp, otpRecord.otpHash);

    if (!isValid) {
      const remainingAttempts = this.MAX_ATTEMPTS - (otpRecord.attempts + 1);
      
      if (remainingAttempts <= 0) {
        await this.prisma.otp.update({
          where: { id: otpRecord.id },
          data: { verified: true },
        });
        throw new UnauthorizedException('Invalid OTP. Maximum attempts exceeded');
      }
      
      throw new UnauthorizedException(
        `Invalid OTP. ${remainingAttempts} attempt(s) remaining`,
      );
    }

    // Mark OTP as verified
    await this.prisma.otp.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    return true;
  }

  /**
   * Verify OTP for User (Admin)
   */
  async verifyOtpForUser(userId: string, otp: string): Promise<boolean> {
    const otpRecord = await this.prisma.otp.findFirst({
      where: {
        userId,
        verified: false,
        expiresAt: {
          gte: new Date(),
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Check attempt limit
    if (otpRecord.attempts >= this.MAX_ATTEMPTS) {
      await this.prisma.otp.update({
        where: { id: otpRecord.id },
        data: { verified: true },
      });
      throw new UnauthorizedException(
        'Maximum verification attempts exceeded. Please request a new OTP',
      );
    }

    // Increment attempt counter
    await this.prisma.otp.update({
      where: { id: otpRecord.id },
      data: { attempts: otpRecord.attempts + 1 },
    });

    // Verify OTP
    const isValid = await bcrypt.compare(otp, otpRecord.otpHash);

    if (!isValid) {
      const remainingAttempts = this.MAX_ATTEMPTS - (otpRecord.attempts + 1);
      
      if (remainingAttempts <= 0) {
        await this.prisma.otp.update({
          where: { id: otpRecord.id },
          data: { verified: true },
        });
        throw new UnauthorizedException('Invalid OTP. Maximum attempts exceeded');
      }
      
      throw new UnauthorizedException(
        `Invalid OTP. ${remainingAttempts} attempt(s) remaining`,
      );
    }

    // Mark OTP as verified
    await this.prisma.otp.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    return true;
  }

  /**
   * Clean up expired OTPs
   */
  async cleanupExpiredOtps(): Promise<number> {
    const result = await this.prisma.otp.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  }
}