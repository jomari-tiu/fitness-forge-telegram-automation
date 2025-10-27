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
      useFactory: () => ({
        token: process.env.TELEGRAM_BOT_TOKEN ?? '',
        launchOptions: {
          dropPendingUpdates: true,
          // Disable automatic webhook - handle it manually
        },
      }),
    }),
    ContentModule,
    InquiryModule,
    RetryModule,
  ],
  controllers: [TelegramController],
  providers: [TelegramUpdate, WebhookSetupService],
})
export class TelegramModule {}
