import { Controller, Get, Post, Body, Logger } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('telegram')
  handleTelegramWebhook(@Body() body: any) {
    this.logger.log(`🔔 Received Telegram webhook: ${JSON.stringify(body)}`);
    // This will be handled by nestjs-telegraf automatically
    return { ok: true };
  }
}
