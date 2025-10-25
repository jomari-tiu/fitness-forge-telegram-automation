import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { TelegramUpdate } from './telegram.update';
import { ContentModule } from '../content/content.module';
import { InquiryModule } from '../inquiry/inquiry.module';
import { RetryModule } from '../retry/retry.module';
import * as dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const webhookDomain = process.env.TELEGRAM_WEBHOOK_DOMAIN;

@Module({
  imports: [
    TelegrafModule.forRoot({
      token: process.env.TELEGRAM_BOT_TOKEN ?? '',
      launchOptions:
        isProduction && webhookDomain
          ? {
              dropPendingUpdates: true,
              webhook: {
                domain: webhookDomain,
                hookPath: '/telegram',
              },
            }
          : {
              dropPendingUpdates: true,
            },
    }),
    ContentModule,
    InquiryModule,
    RetryModule,
  ],
  providers: [TelegramUpdate],
})
export class TelegramModule {}
