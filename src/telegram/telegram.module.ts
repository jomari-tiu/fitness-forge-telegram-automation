import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { TelegramUpdate } from './telegram.update';
import { ContentModule } from '../content/content.module';
import { InquiryModule } from '../inquiry/inquiry.module';
import { RetryModule } from '../retry/retry.module';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [
    TelegrafModule.forRoot({
      token: process.env.TELEGRAM_BOT_TOKEN ?? '',
      launchOptions: {
        dropPendingUpdates: true,
        webhook: {
          domain: process.env.TELEGRAM_WEBHOOK_DOMAIN ?? '',
          hookPath: '/telegram',
        },
      },
    }),
    ContentModule,
    InquiryModule,
    RetryModule,
  ],
  providers: [TelegramUpdate],
})
export class TelegramModule {}
