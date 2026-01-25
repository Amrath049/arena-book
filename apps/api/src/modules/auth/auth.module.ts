import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { PrismaModule } from "src/prisma/prisma.module";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { OtpService } from "./services/otp.service";
import { EmailService } from "src/common/services/email.service";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
    imports: [
        PrismaModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '7d' },
        }),
        PassportModule.register({ defaultStrategy: 'jwt' })],
    controllers: [AuthController],
    providers: [AuthService, OtpService, EmailService, JwtStrategy],
    exports: [AuthService, OtpService],
})
export class AuthModule {}