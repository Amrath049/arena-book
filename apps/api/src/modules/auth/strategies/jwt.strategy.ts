import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";


// strategies/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const { sub, userType } = payload;

    const user = userType === 'PLAYER'
      ? await this.prisma.player.findUnique({ where: { id: sub } })
      : await this.prisma.user.findUnique({ where: { id: sub } });

    if (!user) {
      throw new UnauthorizedException();
    }

    return { ...user, userType }; // Attached to request.user
  }
}