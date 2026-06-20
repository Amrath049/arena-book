import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { AdminLoginDto, verifyAdmin } from './dto/admin.auth.dto';
import { PlayerLoginDto, playerVerify } from './dto/player.auth.dto';
import * as bcrypt from 'bcrypt';
import { OtpService } from './services/otp.service';
import { EmailService } from 'src/common/services/email.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly emailService: EmailService,
  ) {}
  async playerLogin(loginDto: PlayerLoginDto) {
    const { email, password } = loginDto;

    // Find player by email
    const player = await this.prisma.player.findUnique({
      where: { email },
    });

    if (!player || !player.password) {
      throw new UnauthorizedException('User not found, please try to register');
    }

    const otpVeified = await this.prisma.otp.findFirst({
      where: {
        playerId: player.id,
        verified: true,
      },
    });

    if (!otpVeified) {
      throw new UnauthorizedException(
        'Please verify your email, please register again',
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, player.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = {
      sub: player.id,
      email: player.email,
      userType: 'PLAYER',
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      user: {
        id: player.id,
        name: player.name ?? '',
        email: player.email ?? '',
        phone: player.phone ?? '',
        walletBalance: player.walletBalance,
        userType: 'PLAYER',
      },
    };
  }

  async playerRegister(registerDto: PlayerLoginDto) {
    const { email, password } = registerDto;

    // Check if player already exists
    const existingPlayer = await this.prisma.player.findUnique({
      where: { email },
    });

    if (existingPlayer) {
      const otpVeified = await this.prisma.otp.findFirst({
        where: {
          playerId: existingPlayer.id,
          verified: true,
        },
      });

      if (otpVeified) {
        throw new ConflictException('Player with this email already exists');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let player;

    if (existingPlayer) {
      player = await this.prisma.player.update({
        where: { id: existingPlayer.id },
        data: {
          password: hashedPassword,
          registeredSource: 'EMAIL',
        },
        select: {
          id: true,
          email: true,
        },
      });
    } else {
      // Create new player
      player = await this.prisma.player.create({
        data: {
          email,
          password: hashedPassword,
          registeredSource: 'EMAIL',
        },
        select: {
          id: true,
          email: true,
        },
      });
    }

    const { otp, expiresAt } =
      await this.otpService.generateAndSaveOtpForPlayer(
        player.id,
        player.email as string,
        6,
      );

    console.log(`Player ${email} OTP: ${otp}`);

    await this.emailService.sendOtpEmail(email, otp, 10);

    return {
      message:
        'Registration initiated. Please verify your email with the OTP sent',
      playerId: player.id,
      expiresAt,
    };
  }

  async playerVerifyOtp(verifyOtpDto: playerVerify) {
    const { email, otp, phone, name } = verifyOtpDto;

    const player = await this.prisma.player.findUnique({
      where: { email },
    });

    if (!player) {
      throw new NotFoundException('No account found with this email');
    }

    const existingPlayer = await this.prisma.player.findUnique({
      where: { phone },
    });

    if (existingPlayer) {
      throw new ConflictException('Player with this phone already exists');
    }

    // Verify OTP
    await this.otpService.verifyOtpForPlayer(player.id, otp);

    // Optionally update player as verified
    await this.prisma.player.update({
      where: { id: player.id },
      data: { phone, name },
    });

    // Auto-login after successful OTP verification
    const payload = {
      sub: player.id,
      email: player.email,
      userType: 'PLAYER',
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      user: {
        id: player.id,
        name: player.name ?? '',
        email: player.email ?? '',
        phone: player.phone ?? '',
        walletBalance: player.walletBalance,
        userType: 'PLAYER',
      },
      message: 'Email verified successfully',
    };
  }

  // ============ ADMIN AUTH ============

  async adminLogin(loginDto: AdminLoginDto) {
    const { email, password } = loginDto;

    // Find user (admin) by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const otpVeified = await this.prisma.otp.findFirst({
      where: {
        userId: user.id,
        verified: true,
      },
    });

    if (!otpVeified) {
      throw new UnauthorizedException(
        'Please verify your email, please register again',
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      userType: 'USER',
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        name: user.name ?? '',
        email: user.email ?? '',
        phone: user.phone ?? '',
        walletBalance: user.walletBalance,
        userType: 'USER',
      },
    };
  }

  async adminRegister(registerDto: AdminLoginDto) {
    const { email, password } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    console.log(existingUser);

    if (existingUser) {
      const otpVeified = await this.prisma.otp.findFirst({
        where: {
          userId: existingUser.id,
          verified: true,
        },
      });

      if (otpVeified) {
        throw new ConflictException('User with this email already exists');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let user;

    // Create new user (admin)
    if (existingUser) {
      user = await this.prisma.user.update({
        where: { id: existingUser.id },
        data: {
          password: hashedPassword,
          registeredSource: 'EMAIL',
        },
        select: {
          id: true,
          email: true,
        },
      });
    } else {
      user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          registeredSource: 'EMAIL',
        },
      });
    }

    // Generate and send OTP
    const { otp, expiresAt } = await this.otpService.generateAndSaveOtpForUser(
      user.id,
      user.email as string,
      6,
    );

    console.log(`User ${email} OTP: ${otp}`);

    await this.emailService.sendOtpEmail(email, otp, 10);

    return {
      message:
        'Registration initiated. Please verify your email with the OTP sent',
      userId: user.id,
      expiresAt,
    };
  }

  async adminVerifyOtp(verifyOtpDto: verifyAdmin) {
    const { email, otp, phone, name } = verifyOtpDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('No account found with this email');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      throw new ConflictException('User with this phone already exists');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { phone, name },
    });

    // Verify OTP
    await this.otpService.verifyOtpForUser(user.id, otp);

    // Auto-login after successful OTP verification
    const payload = {
      sub: user.id,
      email: user.email,
      userType: 'USER',
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        name: user.name ?? '',
        email: user.email ?? '',
        phone,
        walletBalance: user.walletBalance,
        userType: 'USER',
      },
      message: 'Email verified successfully',
    };
  }

  // ============ HELPER METHODS ============

  async validateUser(userId: string, userType: 'PLAYER' | 'USER') {
    if (userType === 'PLAYER') {
      return await this.prisma.player.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          walletBalance: true,
        },
      });
    } else {
      return await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          walletBalance: true,
        },
      });
    }
  }
}
