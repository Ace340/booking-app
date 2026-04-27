/**
 * JWT Strategy
 *
 * Passport strategy for JWT authentication.
 * Validates JWT tokens and extracts user information.
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../services/auth.service';
import { JwtPayload, AuthUser } from '../types/auth.types';

/**
 * JWT Strategy
 *
 * Validates JWT tokens from the Authorization header.
 * Extracts user information and attaches it to the request.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret-key',
    });
  }

  /**
   * Validate JWT payload
   * @param payload - JWT payload
   * @returns User data if valid
   * @throws UnauthorizedException if user not found
   */
  async validate(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.authService.validateToken(payload);
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }
    return user;
  }
}
