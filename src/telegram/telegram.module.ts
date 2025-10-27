import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { TelegramUpdate } from './telegram.update';
import { TelegramController } from './telegram.controller';
import { ContentModule } from '../content/content.module';
import { InquiryModule } from '../inquiry/inquiry.module';
import { RetryModule } from '../retry/retry.module';
import * as dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

@Module({
  imports: [
    ConfigModule,
    TelegrafModule.forRootAsync({
      useFactory: async () => {
        const isProduction = process.env.NODE_ENV === 'production';
        const useWebhook = process.env.USE_WEBHOOK === 'true';
        const botToken = process.env.TELEGRAM_BOT_TOKEN ?? '';

        // Clear webhook before starting polling (prevents 409 conflicts)
        if (isProduction && !useWebhook && botToken) {
          try {
            console.log('🧹 Clearing webhook before starting polling...');
            await axios.post(
              `https://api.telegram.org/bot${botToken}/deleteWebhook`,
              {
                drop_pending_updates: true,
              },
            );
            console.log('✅ Webhook cleared successfully');
          } catch (error) {
            console.warn(
              '⚠️ Failed to clear webhook:',
              error instanceof Error ? error.message : 'Unknown error',
            );
          }
        }

        if (isProduction && useWebhook) {
          // Use webhook in production (if explicitly enabled)
          return {
            token: botToken,
            launchOptions: {
              dropPendingUpdates: true,
            },
          };
        } else {
          // Use polling (better for free tier)
          return {
            token: botToken,
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
  providers: [TelegramUpdate],
})
export class TelegramModule {}
