// auth/auth.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PlayerLoginDto, playerVerify } from './dto/player.auth.dto';
import { AdminLoginDto, verifyAdmin } from './dto/admin.auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // ============ PLAYER ROUTES ============

  @Post('player/login')
  async playerLogin(@Body() loginDto: PlayerLoginDto) {
    try {
      return this.authService.playerLogin(loginDto);
    } catch (error) {
      throw error;
    }
  }

  @Post('player/register')
  async playerRegister(@Body() registerDto: PlayerLoginDto) {
    try {
      return this.authService.playerRegister(registerDto);
    } catch (error) {
      throw error;
    }
  }

  @Post('player/verify-otp')
  async playerVerifyOtp(@Body() verifyOtpDto: playerVerify) {
    try {
      return this.authService.playerVerifyOtp(verifyOtpDto);
    } catch (error) {
      throw error;
    }
  }

  // ============ ADMIN ROUTES ============

  @Post('admin/login')
  async adminLogin(@Body() loginDto: AdminLoginDto) {
    try {
      return this.authService.adminLogin(loginDto);
    } catch (error) {
      throw error;
    }
  }

  @Post('admin/register')
  async adminRegister(@Body() registerDto: AdminLoginDto) {
    try {
      return this.authService.adminRegister(registerDto);
    } catch (error) {
      throw error;
    }
  }

  @Post('admin/verify-otp')
  async adminVerifyOtp(@Body() verifyOtpDto: verifyAdmin) {
    try {
      return this.authService.adminVerifyOtp(verifyOtpDto);
    } catch (error) {
      throw error;
    }
  }
}
