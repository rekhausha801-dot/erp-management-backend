import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthTokens, JwtPayload, LoginResponse } from './interfaces/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const result = await this.prisma.$transaction(async (tx) => {
      let companyId = dto.companyId;
      let assignedRole: Role = (dto.role as Role) ?? Role.EMPLOYEE;

      if (!companyId && dto.companyName) {
        const company = await tx.company.create({
          data: {
            name: dto.companyName,
            email: dto.email,
          },
        });
        companyId = company.id;
        assignedRole = Role.ADMIN;
      }

      if (!companyId) {
        throw new BadRequestException(
          'Either companyId or companyName must be provided',
        );
      }

      const company = await tx.company.findUnique({ where: { id: companyId } });
      if (!company) {
        throw new NotFoundException('Company not found');
      }

      const user = await tx.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
        },
      });

      await tx.userCompany.create({
        data: {
          userId: user.id,
          companyId,
          role: assignedRole,
        },
      });

      return { user, companyId, role: assignedRole };
    });

    const tokens = await this.generateTokens({
      sub: result.user.id,
      email: result.user.email,
      companyId: result.companyId,
      role: result.role,
    });

    await this.saveRefreshToken(result.user.id, tokens.refreshToken);

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        companyId: result.companyId,
        role: result.role,
      },
      tokens,
    };
  }

  async login(dto: LoginDto): Promise<LoginResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        companies: {
          where: { isActive: true },
          include: { company: true },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const activeCompanies = user.companies.filter((uc) => uc.company.isActive);
    if (activeCompanies.length === 0) {
      throw new ForbiddenException('User does not belong to any active company');
    }

    if (!dto.companyId && activeCompanies.length > 1) {
      return {
        requiresCompanySelection: true,
        companies: activeCompanies.map((uc) => ({
          companyId: uc.companyId,
          companyName: uc.company.name,
          role: uc.role,
        })),
      };
    }

    const selected = dto.companyId
      ? activeCompanies.find((uc) => uc.companyId === dto.companyId)
      : activeCompanies[0];

    if (!selected) {
      throw new ForbiddenException('You do not have access to the selected company');
    }

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      companyId: selected.companyId,
      role: selected.role,
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        refreshToken: await bcrypt.hash(tokens.refreshToken, 10),
      },
    });

    return {
      requiresCompanySelection: false,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        companyId: selected.companyId,
        role: selected.role,
      },
      tokens,
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(dto.refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive || !user.refreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    const matches = await bcrypt.compare(dto.refreshToken, user.refreshToken);
    if (!matches) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const targetCompanyId = dto.companyId ?? payload.companyId;
    const membership = await this.prisma.userCompany.findUnique({
      where: {
        userId_companyId: {
          userId: user.id,
          companyId: targetCompanyId,
        },
      },
    });

    if (!membership || !membership.isActive) {
      throw new ForbiddenException('No access to requested company');
    }

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      companyId: targetCompanyId,
      role: membership.role,
    });

    await this.saveRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return { message: 'Logged out successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      return {
        message: 'If that email exists, a password reset token has been generated',
      };
    }

    const resetToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, purpose: 'password-reset' },
      {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: '15m',
      },
    );

    return {
      message: 'Password reset token generated',
      resetToken,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    let payload: { sub: string; purpose?: string };
    try {
      payload = await this.jwtService.verifyAsync(dto.token, {
        secret: this.configService.get<string>('jwt.secret'),
      });
    } catch {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (payload.purpose !== 'password-reset') {
      throw new BadRequestException('Invalid reset token');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { id: payload.sub },
      data: { password: hashedPassword, refreshToken: null },
    });

    return { message: 'Password reset successful' };
  }

  private async generateTokens(payload: JwtPayload): Promise<AuthTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.get<string>('jwt.expiresIn') ?? '1d',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiresIn') ?? '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: string, refreshToken: string) {
    const hashed = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashed },
    });
  }
}
