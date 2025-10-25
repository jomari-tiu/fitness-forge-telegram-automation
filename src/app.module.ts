import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegramModule } from './telegram/telegram.module';
import { DatabaseModule } from './database/database.module';
import { InquiryModule } from './inquiry/inquiry.module';
import { ContentModule } from './content/content.module';
import { DeliveryModule } from './delivery/delivery.module';
import { RetryModule } from './retry/retry.module';
import { ApiModule } from './api/api.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    TelegramModule,
    InquiryModule,
    ContentModule,
    DeliveryModule,
    RetryModule,
    ApiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
