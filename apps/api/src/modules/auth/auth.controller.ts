import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PlayerLoginDto, playerVerify } from './dto/player.auth.dto';
import { AdminLoginDto, verifyAdmin } from './dto/admin.auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // ============ PLAYER ROUTES ============

  @Post('player/login')
  playerLogin(@Body() loginDto: PlayerLoginDto) {
    return this.authService.playerLogin(loginDto);
  }

  @Post('player/register')
  playerRegister(@Body() registerDto: PlayerLoginDto) {
    return this.authService.playerRegister(registerDto);
  }

  @Post('player/verify-otp')
  playerVerifyOtp(@Body() verifyOtpDto: playerVerify) {
    return this.authService.playerVerifyOtp(verifyOtpDto);
  }

  // ============ ADMIN ROUTES ============

  @Post('admin/login')
  adminLogin(@Body() loginDto: AdminLoginDto) {
    return this.authService.adminLogin(loginDto);
  }

  @Post('admin/register')
  adminRegister(@Body() registerDto: AdminLoginDto) {
    return this.authService.adminRegister(registerDto);
  }

  @Post('admin/verify-otp')
  adminVerifyOtp(@Body() verifyOtpDto: verifyAdmin) {
    return this.authService.adminVerifyOtp(verifyOtpDto);
  }
}
