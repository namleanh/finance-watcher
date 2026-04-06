import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, ResendVerificationDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { MailService } from '../mail/mail.service';
import { AuthConfig } from '../config/auth.config';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  // ── Register ──────────────────────────────────────────────
  async register(dto: RegisterDto) {
    // Check if email exists
    const emailExists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (emailExists) throw new ConflictException('Email đã được sử dụng');

    // Check if username exists
    const usernameExists = await this.prisma.user.findUnique({ where: { username: dto.username } });
    if (usernameExists) throw new ConflictException('Username đã được sử dụng');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + AuthConfig.emailVerificationExpiresInHours);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username.toLowerCase(),
        passwordHash,
        displayName: dto.displayName || dto.username,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      },
    });

    // Send verification email
    await this.mailService.sendVerificationEmail(user.email, user.displayName || user.username, verificationToken);

    return { message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.' };
  }

  // ── Verify Email ──────────────────────────────────────────
  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: { 
        emailVerificationToken: token,
        emailVerificationExpires: { gte: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Mã xác thực không hợp lệ hoặc đã hết hạn');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    return { message: 'Xác thực email thành công' };
  }

  // ── Resend Verification Email ─────────────────────────────
  async resendVerification(dto: import('./dto/auth.dto').ResendVerificationDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.email.toLowerCase() },
          { username: dto.email.toLowerCase() },
        ],
      },
    });

    if (!user) {
      throw new BadRequestException('Tài khoản không tồn tại.');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Tài khoản đã được xác thực.');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + AuthConfig.emailVerificationExpiresInHours);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { 
        emailVerificationToken: token,
        emailVerificationExpires: verificationExpires,
      },
    });

    await this.mailService.sendVerificationEmail(user.email, user.displayName || user.username, token);

    return { message: 'Email xác thực đã được gửi lại thành công.' };
  }

  // ── Login ─────────────────────────────────────────────────
  async login(dto: LoginDto) {
    const { identifier, password } = dto;

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier.toLowerCase() },
          { username: identifier.toLowerCase() },
        ],
      },
    });

    if (!user) throw new UnauthorizedException('Thông tin đăng nhập không chính xác');

    if (!user.isEmailVerified) throw new UnauthorizedException('Vui lòng xác thực email trước khi đăng nhập');

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) throw new UnauthorizedException('Thông tin đăng nhập không chính xác');

    return this.generateTokens(user.id, user.email);
  }

  // ── Forgot Password ───────────────────────────────────────
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.identifier.toLowerCase() },
          { username: dto.identifier.toLowerCase() },
        ],
      },
    });

    if (!user) {
      // Vì lý do bảo mật, không báo lỗi "không tìm thấy user" mà chỉ trả về thông báo chung
      return { message: 'Nếu tài khoản tồn tại, một email hướng dẫn đã được gửi đi.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + AuthConfig.resetPasswordExpiresInHours); 

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      },
    });

    await this.mailService.sendPasswordResetEmail(user.email, user.displayName || user.username, resetToken);

    return { message: 'Email đặt lại mật khẩu đã được gửi.' };
  }

  // ── Reset Password ────────────────────────────────────────
  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: dto.token,
        resetPasswordExpires: { gte: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return { message: 'Mật khẩu đã được thay đổi thành công' };
  }

  // ── Refresh Token ─────────────────────────────────────────
  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.refreshToken) throw new UnauthorizedException('Access denied');

    const rtValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!rtValid) throw new UnauthorizedException('Access denied');

    return this.generateTokens(user.id, user.email);
  }

  // ── Logout ────────────────────────────────────────────────
  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return { message: 'Logged out successfully' };
  }

  // ── Get current user ──────────────────────────────────────
  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        email: true, 
        username: true, 
        displayName: true, 
        isEmailVerified: true,
        baseCurrency: true, 
        createdAt: true 
      },
    });
    if (!user) throw new UnauthorizedException();
    return user;
  }

  // ── Helper ────────────────────────────────────────────────
  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      }),
    ]);

    // Store hashed refresh token
    const hashedRt = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRt },
    });

    return { accessToken, refreshToken, userId };
  }
}
