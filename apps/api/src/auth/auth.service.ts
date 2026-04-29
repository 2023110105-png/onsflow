import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { db } from '../database/db';
import { users } from '../database/drizzle/schema/tenant/users';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async register(dto: RegisterDto) {
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, dto.email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new UnauthorizedException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user (temporary - will need tenant context in production)
    const newUser = await db
      .insert(users)
      .values({
        email: dto.email,
        name: dto.name,
        password: hashedPassword,
        phone: dto.phone,
        role: 'owner', // Default role for first user
        isActive: true,
      })
      .returning();

    // Generate JWT token
    const payload = { sub: newUser[0].id, email: newUser[0].email };
    const token = await this.jwtService.signAsync(payload);

    return {
      access_token: token,
      user: {
        id: newUser[0].id,
        email: newUser[0].email,
        name: newUser[0].name,
        role: newUser[0].role,
      },
    };
  }

  async login(dto: LoginDto) {
    // Find user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, dto.email))
      .limit(1);

    if (user.length === 0) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user[0].password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user[0].isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Update last login
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user[0].id));

    // Generate JWT token
    const payload = { sub: user[0].id, email: user[0].email };
    const token = await this.jwtService.signAsync(payload);

    return {
      access_token: token,
      user: {
        id: user[0].id,
        email: user[0].email,
        name: user[0].name,
        role: user[0].role,
        outletId: user[0].outletId,
      },
    };
  }

  async validateUser(userId: number) {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0 || !user[0].isActive) {
      return null;
    }

    return {
      id: user[0].id,
      email: user[0].email,
      name: user[0].name,
      role: user[0].role,
      outletId: user[0].outletId,
    };
  }
}
