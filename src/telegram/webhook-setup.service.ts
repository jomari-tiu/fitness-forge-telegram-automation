import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class WebhookSetupService implements OnModuleInit {
  private readonly logger = new Logger(WebhookSetupService.name);

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    // Only set webhook in production
    if (this.configService.get('NODE_ENV') === 'production') {
      await this.setupWebhook();
    }
  }

  private async setupWebhook() {
    try {
      const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
      const webhookDomain = this.configService.get<string>(
        'TELEGRAM_WEBHOOK_DOMAIN',
      );

      if (!botToken || !webhookDomain) {
        this.logger.warn(
          'Missing TELEGRAM_BOT_TOKEN or TELEGRAM_WEBHOOK_DOMAIN',
        );
        return;
      }

      const webhookUrl = `${webhookDomain}/telegram`;
      const telegramApiUrl = `https://api.telegram.org/bot${botToken}/setWebhook`;

      this.logger.log(`🔧 Setting up webhook: ${webhookUrl}`);

      const response = await axios.post(telegramApiUrl, {
        url: webhookUrl,
        drop_pending_updates: true,
      });

      const data = response.data as { ok: boolean; description?: string };
      if (data.ok) {
        this.logger.log('✅ Webhook configured successfully');
      } else {
        this.logger.error(`❌ Failed to set webhook: ${data.description}`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`❌ Webhook setup error: ${errorMessage}`);
    }
  }
}
