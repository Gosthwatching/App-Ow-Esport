import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Pool } from 'pg';
import { compare, hash } from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { AuthenticatedUser } from './authenticated-user.interface';
import {
  canAssignRole,
  normalizeRole,
  type CanonicalRole,
} from '../security/role-hierarchy';

@Injectable()
export class AuthService {
  constructor(
    @Inject('DATABASE_POOL') private readonly db: Pool,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const passwordHash = await hash(dto.password, 12);

    try {
      const result = await this.db.query(
        `INSERT INTO app_users (username, display_name, password_hash, role)
         VALUES ($1, $2, $3, 'joueur')
         RETURNING id, username, display_name, role`,
        [dto.username, dto.displayName ?? null, passwordHash],
      );

      const user = result.rows[0];
      const payload: AuthenticatedUser = {
        sub: user.id,
        username: user.username,
        role: user.role,
      };

      const accessToken = await this.jwtService.signAsync(payload);

      return {
        message: 'User registered',
        accessToken,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.display_name,
          role: user.role,
        },
      };
    } catch (error) {
      if ((error as { code?: string }).code === '23505') {
        throw new ConflictException('Username already exists');
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const result = await this.db.query(
      `SELECT id, username, display_name, password_hash, role
       FROM app_users
       WHERE username = $1`,
      [dto.username],
    );

    if (result.rows.length === 0) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = result.rows[0];

    if (!user.password_hash) {
      throw new UnauthorizedException('This account has no password set');
    }

    const isValidPassword = await compare(dto.password, user.password_hash);

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: AuthenticatedUser = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      message: 'Login successful',
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
        role: user.role,
      },
    };
  }

  async getMe(userId: number) {
    const result = await this.db.query(
      `SELECT id, username, display_name, role, created_at
       FROM app_users
       WHERE id = $1`,
      [userId],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('User not found');
    }

    const user = result.rows[0];
    return {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      role: user.role,
      createdAt: user.created_at,
    };
  }

  async setUserRole(
    userId: number,
    role: CanonicalRole,
    actor: AuthenticatedUser,
  ) {
    if (actor.sub === userId) {
      throw new ForbiddenException('You cannot change your own role');
    }

    const targetResult = await this.db.query(
      `SELECT id, username, display_name, role
       FROM app_users
       WHERE id = $1`,
      [userId],
    );

    if (targetResult.rows.length === 0) {
      throw new NotFoundException('Target user not found');
    }

    const targetUser = targetResult.rows[0];
    const targetRole = normalizeRole(targetUser.role) ?? targetUser.role;

    if (!canAssignRole(actor.role, targetRole, role)) {
      throw new ForbiddenException(
        'Insufficient hierarchy level to assign this role',
      );
    }

    const updatedResult = await this.db.query(
      `UPDATE app_users
       SET role = $1
       WHERE id = $2
       RETURNING id, username, display_name, role`,
      [role, userId],
    );

    const updatedUser = updatedResult.rows[0];

    return {
      message: 'Role updated',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        displayName: updatedUser.display_name,
        role: updatedUser.role,
      },
    };
  }
}
