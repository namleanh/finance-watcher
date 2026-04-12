import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, ResendVerificationDto, UpdateProfileDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { MailService } from '../mail/mail.service';
import { AuthConfig } from '../config/auth.config';
import { generateBlindIndex, encryptField, decryptField } from '../utils/crypto.util';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  // ── Register ──────────────────────────────────────────────
  async register(dto: RegisterDto) {
    const emailHash = generateBlindIndex(dto.email);
    const usernameHash = generateBlindIndex(dto.username);

    // Check if email exists via Hash
    const emailExists = await this.prisma.user.findUnique({ where: { emailHash } });
    if (emailExists) throw new ConflictException('Email đã được sử dụng');

    // Check if username exists via Hash
    const usernameExists = await this.prisma.user.findUnique({ where: { usernameHash } });
    if (usernameExists) throw new ConflictException('Username đã được sử dụng');

    const userId = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + AuthConfig.emailVerificationExpiresInHours);

    // Encrypt fields using the pre-generated userId
    const encryptedEmail = encryptField(dto.email, userId);
    const encryptedUsername = encryptField(dto.username.toLowerCase(), userId);
    const encryptedDisplayName = encryptField(dto.displayName || dto.username, userId);

    const user = await this.prisma.user.create({
      data: {
        id: userId,
        emailHash,
        usernameHash,
        email: encryptedEmail!,
        username: encryptedUsername!,
        passwordHash,
        displayName: encryptedDisplayName,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      },
    });

    // Send verification email (using plain text for mailer)
    await this.mailService.sendVerificationEmail(dto.email, dto.displayName || dto.username, verificationToken);

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
  async resendVerification(dto: ResendVerificationDto) {
    const identifierHash = generateBlindIndex(dto.email);
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { emailHash: identifierHash },
          { usernameHash: identifierHash },
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

    const plainEmail = decryptField(user.email, user.id)!;
    const plainName = decryptField(user.displayName, user.id) || decryptField(user.username, user.id)!;

    await this.mailService.sendVerificationEmail(plainEmail, plainName, token);

    return { message: 'Email xác thực đã được gửi lại thành công.' };
  }

  // ── Login ─────────────────────────────────────────────────
  async login(dto: LoginDto) {
    const { identifier, password } = dto;
    const identifierHash = generateBlindIndex(identifier);

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { emailHash: identifierHash },
          { usernameHash: identifierHash },
        ],
      },
    });

    if (!user) throw new UnauthorizedException('Thông tin đăng nhập không chính xác');

    if (!user.isEmailVerified) throw new UnauthorizedException('Vui lòng xác thực email trước khi đăng nhập');

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) throw new UnauthorizedException('Thông tin đăng nhập không chính xác');

    const plainEmail = decryptField(user.email, user.id)!;
    return this.generateTokens(user.id, plainEmail);
  }

  // ── Forgot Password ───────────────────────────────────────
  async forgotPassword(dto: ForgotPasswordDto) {
    const identifierHash = generateBlindIndex(dto.identifier);
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { emailHash: identifierHash },
          { usernameHash: identifierHash },
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

    const plainEmail = decryptField(user.email, user.id)!;
    const plainName = decryptField(user.displayName, user.id) || decryptField(user.username, user.id)!;

    await this.mailService.sendPasswordResetEmail(plainEmail, plainName, resetToken);

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

    const plainEmail = decryptField(user.email, user.id)!;
    return this.generateTokens(user.id, plainEmail);
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
    });
    if (!user) throw new UnauthorizedException();
    
    return {
      id: user.id,
      email: decryptField(user.email, user.id),
      username: decryptField(user.username, user.id),
      displayName: decryptField(user.displayName, user.id),
      isEmailVerified: user.isEmailVerified,
      baseCurrency: user.baseCurrency,
      createdAt: user.createdAt,
    };
  }

  // ── Update profile ────────────────────────────────────────
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const data: any = {};
    
    if (dto.username) {
      const usernameHash = generateBlindIndex(dto.username);
      // Check if new username is taken by someone else
      const existing = await this.prisma.user.findFirst({
        where: { 
          usernameHash,
          id: { not: userId }
        }
      });
      if (existing) throw new ConflictException('Username đã được sử dụng');
      
      data.usernameHash = usernameHash;
      data.username = encryptField(dto.username.toLowerCase(), userId);
    }

    if (dto.displayName) {
      data.displayName = encryptField(dto.displayName, userId);
    }

    if (dto.baseCurrency) {
      data.baseCurrency = dto.baseCurrency;
    }

    if (Object.keys(data).length === 0) return { message: 'Không có thông tin thay đổi' };

    await this.prisma.user.update({
      where: { id: userId },
      data,
    });

    return { message: 'Cập nhật thông tin thành công' };
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
