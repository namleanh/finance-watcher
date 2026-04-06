import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendVerificationEmail(email: string, displayName: string, token: string) {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

    const mailOptions = {
      from: `"Finance Watcher" <${process.env.SMTP_FROM || 'noreply@finance-watcher.com'}>`,
      to: email,
      subject: 'Xác thực tài khoản Finance Watcher của bạn',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #4f46e5;">Chào ${displayName || 'bạn'},</h2>
          <p>Cảm ơn bạn đã đăng ký tài khoản tại Finance Watcher. Để bắt đầu, vui lòng nhấn vào nút bên dưới để xác thực địa chỉ email:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Xác thực tài khoản</a>
          </div>
          <p style="color: #64748b; font-size: 14px;">Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email này.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} Finance Watcher. All rights reserved.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new InternalServerErrorException('Không thể gửi email xác thực');
    }
  }

  async sendPasswordResetEmail(email: string, displayName: string, token: string) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    const mailOptions = {
      from: `"Finance Watcher" <${process.env.SMTP_FROM || 'noreply@finance-watcher.com'}>`,
      to: email,
      subject: 'Yêu cầu đặt lại mật khẩu - Finance Watcher',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #4f46e5;">Chào ${displayName || 'bạn'},</h2>
          <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản tại Finance Watcher. Vui lòng nhấn vào nút bên dưới để thực hiện thay đổi. <b>Lưu ý: Liên kết này sẽ hết hạn sau 1 giờ.</b></p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Đặt lại mật khẩu</a>
          </div>
          <p style="color: #64748b; font-size: 14px;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng liên hệ với chúng tôi để được hỗ trợ.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} Finance Watcher. All rights reserved.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new InternalServerErrorException('Không thể gửi email đặt lại mật khẩu');
    }
  }
}
