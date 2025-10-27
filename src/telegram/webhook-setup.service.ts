import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class WebhookSetupService implements OnModuleInit {
  private readonly logger = new Logger(WebhookSetupService.name);

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    const useWebhook = this.configService.get('USE_WEBHOOK') === 'true';

    if (isProduction) {
      if (useWebhook) {
        await this.setupWebhook();
      } else {
        // Clear webhook to enable polling
        await this.clearWebhook();
      }
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

  private async clearWebhook() {
    try {
      const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');

      if (!botToken) {
        this.logger.warn('Missing TELEGRAM_BOT_TOKEN');
        return;
      }

      const telegramApiUrl = `https://api.telegram.org/bot${botToken}/deleteWebhook`;

      this.logger.log('🧹 Clearing webhook to enable polling...');

      const response = await axios.post(telegramApiUrl, {
        drop_pending_updates: true,
      });

      const data = response.data as { ok: boolean; description?: string };
      if (data.ok) {
        this.logger.log(
          '✅ Webhook cleared successfully - polling can now start',
        );
      } else {
        this.logger.error(`❌ Failed to clear webhook: ${data.description}`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`❌ Webhook clear error: ${errorMessage}`);
    }
  }
}
