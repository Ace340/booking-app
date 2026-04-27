/**
 * Auth Service
 *
 * Contains business logic for authentication and authorization.
 * Follows clean architecture: pure functions, no side effects.
 */

import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from '../repositories/auth.repository';
import { RegisterDto, LoginDto } from '../dto';
import { AuthUser, JwtPayload, RegisterUserData, AuthResponse } from '../types/auth.types';
import { ConfigService } from '@nestjs/config';

/**
 * Auth Service
 *
 * Handles authentication business logic.
 * All methods are pure functions with explicit dependencies.
 */
@Injectable()
export class AuthService {
  private readonly saltRounds: number = 10;

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Register a new user
   * @param registerDto - Registration data
   * @returns Auth response with access token and user data
   * @throws ConflictException if email already exists
   */
  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    // Check if email already exists
    const emailExists = await this.authRepository.emailExists(registerDto.email);
    if (emailExists) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(registerDto.password);

    // Create user data
    const userData: RegisterUserData = {
      email: registerDto.email,
      password: hashedPassword,
      name: registerDto.name,
      companyId: registerDto.companyId,
      role: registerDto.role,
    };

    // Create user
    const user = await this.authRepository.create(userData);

    // Generate token
    const accessToken = await this.generateToken(this.buildJwtPayload(user));

    // Build response (exclude password)
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: user.companyId,
    };

    return {
      accessToken,
      user: {
        id: authUser.id,
        email: authUser.email,
        name: authUser.name,
        role: authUser.role,
      },
    };
  }

  /**
   * Login user
   * @param loginDto - Login data
   * @returns Auth response with access token and user data
   * @throws UnauthorizedException if credentials are invalid
   */
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    // Find user by email
    const user = await this.authRepository.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await this.verifyPassword(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate token
    const accessToken = await this.generateToken(this.buildJwtPayload(user));

    // Build response (exclude password)
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: user.companyId,
    };

    return {
      accessToken,
      user: {
        id: authUser.id,
        email: authUser.email,
        name: authUser.name,
        role: authUser.role,
      },
    };
  }

  /**
   * Validate JWT token
   * @param payload - JWT payload
   * @returns User data if valid, null otherwise
   */
  async validateToken(payload: JwtPayload): Promise<AuthUser | null> {
    const user = await this.authRepository.findById(payload.sub);
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: user.companyId,
    };
  }

  /**
   * Hash password using bcrypt
   * @param password - Plain text password
   * @returns Hashed password
   */
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Verify password against hash
   * @param password - Plain text password
   * @param hash - Hashed password
   * @returns True if password matches, false otherwise
   */
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Build JWT payload from user
   * @param user - User entity
   * @returns JWT payload
   */
  private buildJwtPayload(user: any): JwtPayload {
    return {
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };
  }

  /**
   * Generate JWT token
   * @param payload - JWT payload
   * @returns JWT token string
   */
  private async generateToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload);
  }
}
