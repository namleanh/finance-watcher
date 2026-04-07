import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class MailService {
  private serviceId: string;
  private templateId: string;
  private publicKey: string;
  private privateKey: string;

  constructor() {
    this.serviceId = process.env.EMAILJS_SERVICE_ID || 'service_2w5wjib';
    this.templateId = process.env.EMAILJS_TEMPLATE_ID || 'template_p61i7mn';
    this.publicKey = process.env.EMAILJS_PUBLIC_KEY || ''; // Nhớ cấu hình trong .env nhé
    this.privateKey = process.env.EMAILJS_PRIVATE_KEY || ''; // Nhớ cấu hình trong .env nhé
  }

  private async sendEmailViaEmailJS(toEmail: string, subject: string, messageHtml: string) {
    const payload = {
      service_id: this.serviceId,
      template_id: this.templateId,
      user_id: this.publicKey,
      accessToken: this.privateKey,
      template_params: {
        to_email: toEmail,
        subject: subject,
        message: messageHtml,
      },
    };

    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Lỗi từ EmailJS (Status: ${response.status}):`, errorText);
        throw new Error(`EmailJS từ chối: ${errorText}`);
      }
      
      console.log(`[EmailJS] Bắn mail thành công tới ${toEmail}`);
    } catch (error) {
      console.error('[EmailJS] Lỗi gửi:', error);
      throw error;
    }
  }

  async sendVerificationEmail(email: string, displayName: string, token: string) {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    const subject = 'Xác thực tài khoản Finance Watcher của bạn';
    
    // Giao diện HTML của thư
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #4f46e5;">Chào ${displayName || 'bạn'},</h2>
        <p>Cảm ơn bạn đã đăng ký tài khoản tại Finance Watcher. Để bắt đầu, xin vui lòng nhấn vào nút bên dưới để xác thực địa chỉ email:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Xác thực tài khoản</a>
        </div>
        <p style="color: #64748b; font-size: 14px;">Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email này.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} Finance Watcher. All rights reserved.</p>
      </div>
    `;

    try {
      await this.sendEmailViaEmailJS(email, subject, html);
    } catch (error) {
      throw new InternalServerErrorException('Không thể gửi email xác thực qua EmailJS');
    }
  }

  async sendPasswordResetEmail(email: string, displayName: string, token: string) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    const subject = 'Yêu cầu đặt lại mật khẩu - Finance Watcher';

    const html = `
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
    `;

    try {
      await this.sendEmailViaEmailJS(email, subject, html);
    } catch (error) {
      throw new InternalServerErrorException('Không thể gửi email đặt lại mật khẩu qua EmailJS');
    }
  }
}
