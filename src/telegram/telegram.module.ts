import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { TelegramUpdate } from './telegram.update';
import { TelegramController } from './telegram.controller';
import { WebhookSetupService } from './webhook-setup.service';
import { ContentModule } from '../content/content.module';
import { InquiryModule } from '../inquiry/inquiry.module';
import { RetryModule } from '../retry/retry.module';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [
    ConfigModule,
    TelegrafModule.forRootAsync({
      useFactory: () => {
        const isProduction = process.env.NODE_ENV === 'production';
        const useWebhook = process.env.USE_WEBHOOK === 'true';

        if (isProduction && useWebhook) {
          // Use webhook in production (if explicitly enabled)
          return {
            token: process.env.TELEGRAM_BOT_TOKEN ?? '',
            launchOptions: {
              dropPendingUpdates: true,
            },
          };
        } else {
          // Use polling (better for free tier)
          return {
            token: process.env.TELEGRAM_BOT_TOKEN ?? '',
            launchOptions: {
              dropPendingUpdates: true,
              polling: {
                timeout: 30,
                limit: 100,
              },
            },
          };
        }
      },
    }),
    ContentModule,
    InquiryModule,
    RetryModule,
  ],
  controllers: [TelegramController],
  providers: [TelegramUpdate, WebhookSetupService],
})
export class TelegramModule {}
