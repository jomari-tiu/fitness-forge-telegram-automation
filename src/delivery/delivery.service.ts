import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import axios from 'axios';
import { Telegraf } from 'telegraf';
import { CreateInquiryDto, CrmWebhookDto } from '../schemas/inquiry.schema';

@Injectable()
export class DeliveryService {
  private readonly logger = new Logger(DeliveryService.name);
  private readonly emailTransporter: nodemailer.Transporter;
  private readonly telegramBot: Telegraf;
  private readonly crmUrl: string;
  private readonly staffChannelId: string;

  constructor(private readonly configService: ConfigService) {
    // Initialize email transporter
    this.emailTransporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });

    // Initialize Telegram bot for staff notifications
    const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (botToken) {
      this.telegramBot = new Telegraf(botToken);
    }

    this.crmUrl = this.configService.get<string>(
      'CRM_URL',
      'https://fitness-forge-telegram-automation.onrender.com/api/inquiries',
    );
    this.staffChannelId = this.configService.get<string>(
      'STAFF_CHANNEL_ID',
      '-1003287465736',
    );
  }

  async sendEmailNotification(
    inquiry: CreateInquiryDto,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const emailContent = this.generateEmailContent(inquiry);

      const mailOptions = {
        from: this.configService.get<string>(
          'SMTP_USER',
          'jomaritiu16@gmail.com',
        ),
        to: this.configService.get<string>(
          'NOTIFICATION_EMAIL',
          'jomaritiu16@gmail.com',
        ),
        subject: `🏋️ New Gym Inquiry from ${inquiry.fullName}`,
        html: emailContent,
      };

      await this.emailTransporter.sendMail(mailOptions);

      this.logger.log(
        `Email notification sent successfully for inquiry from ${inquiry.fullName}`,
      );
      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send email notification: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }

  async sendCrmWebhook(
    inquiry: CreateInquiryDto,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const payload: CrmWebhookDto = {
        name: inquiry.fullName,
        phone: inquiry.phone,
        email: inquiry.email,
        preferredClass: inquiry.preferredClass,
      };

      const response = await axios.post(this.crmUrl, payload, {
        timeout: 10000, // 10 seconds timeout
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status >= 200 && response.status < 300) {
        this.logger.log(
          `CRM webhook sent successfully for inquiry from ${inquiry.fullName}`,
        );
        return { success: true };
      } else {
        throw new Error(`CRM webhook returned status ${response.status}`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send CRM webhook: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }

  async sendStaffTelegramNotification(
    inquiry: CreateInquiryDto,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.telegramBot) {
        throw new Error('Telegram bot not initialized');
      }

      const message = this.generateStaffTelegramMessage(inquiry);

      await this.telegramBot.telegram.sendMessage(
        this.staffChannelId,
        message,
        {
          parse_mode: 'HTML',
        },
      );

      this.logger.log(
        `Staff Telegram notification sent successfully for inquiry from ${inquiry.fullName}`,
      );
      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to send staff Telegram notification: ${errorMessage}`,
      );
      return { success: false, error: errorMessage };
    }
  }

  private generateEmailContent(inquiry: CreateInquiryDto): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🏋️ Forge Fitness</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">New Member Inquiry</p>
        </div>
        
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">New Inquiry Details</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">Full Name:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #333;">${inquiry.fullName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">Phone:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #333;">${inquiry.phone}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">Email:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #333;">${inquiry.email}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #555;">Preferred Class:</td>
                <td style="padding: 10px 0; color: #333;">${inquiry.preferredClass}</td>
              </tr>
            </table>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #e8f4fd; border-left: 4px solid #2196F3; border-radius: 4px;">
            <p style="margin: 0; color: #1976D2; font-weight: bold;">💡 Next Steps:</p>
            <p style="margin: 5px 0 0 0; color: #555;">Please follow up with this potential member within 24 hours for the best conversion rate.</p>
          </div>
        </div>
        
        <div style="background-color: #333; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0; font-size: 14px;">This notification was sent automatically by the Forge Fitness inquiry system.</p>
        </div>
      </div>
    `;
  }

  private generateStaffTelegramMessage(inquiry: CreateInquiryDto): string {
    // Escape HTML special characters for Telegram HTML parse mode
    const escapeName = this.escapeHtml(inquiry.fullName);
    const escapePhone = this.escapeHtml(inquiry.phone);
    const escapeEmail = this.escapeHtml(inquiry.email);
    const escapeClass = this.escapeHtml(inquiry.preferredClass);
    const escapeDate = this.escapeHtml(new Date().toLocaleString());

    return `
🏋️ <b>New Gym Inquiry - Forge Fitness</b>

👤 <b>Name:</b> ${escapeName}
📞 <b>Phone:</b> ${escapePhone}
📧 <b>Email:</b> ${escapeEmail}
🎯 <b>Interested in:</b> ${escapeClass}

⏰ <b>Received:</b> ${escapeDate}

💡 <b>Action Required:</b> Please follow up with this potential member within 24 hours for best results!

---
<i>Automated notification from Forge Fitness Bot</i>
    `.trim();
  }

  private escapeHtml(text: string): string {
    // Escape HTML special characters for Telegram HTML parse mode
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // Test email configuration
  async testEmailConfiguration(): Promise<boolean> {
    try {
      await this.emailTransporter.verify();
      this.logger.log('Email configuration is valid');
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Email configuration test failed: ${errorMessage}`);
      return false;
    }
  }

  // Test CRM webhook
  async testCrmWebhook(): Promise<boolean> {
    try {
      const testPayload = {
        name: 'Test User',
        phone: '1234567890',
        email: 'test@example.com',
        preferredClass: 'Test Class',
      };

      const response = await axios.post(this.crmUrl, testPayload, {
        timeout: 5000,
        headers: { 'Content-Type': 'application/json' },
      });

      this.logger.log(`CRM webhook test response: ${response.status}`);
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`CRM webhook test failed: ${errorMessage}`);
      return false;
    }
  }

  // Test Telegram staff notification
  async testStaffTelegramNotification(): Promise<boolean> {
    try {
      if (!this.telegramBot) {
        throw new Error('Telegram bot not initialized');
      }

      await this.telegramBot.telegram.sendMessage(
        this.staffChannelId,
        '🧪 *Test Notification*\n\nThis is a test message from the Forge Fitness inquiry system.',
        { parse_mode: 'Markdown' },
      );

      this.logger.log('Staff Telegram notification test successful');
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Staff Telegram notification test failed: ${errorMessage}`,
      );
      return false;
    }
  }
}
