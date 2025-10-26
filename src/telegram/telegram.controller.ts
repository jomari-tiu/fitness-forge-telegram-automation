import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  Inject,
} from '@nestjs/common';
import { Telegraf } from 'telegraf';

@Controller('telegram')
export class TelegramController {
  private readonly logger = new Logger(TelegramController.name);

  constructor(@Inject('TELEGRAF_BOT') private readonly bot: Telegraf) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async webhook(@Body() update: any) {
    try {
      this.logger.log(`📨 Received webhook update: ${JSON.stringify(update)}`);

      // Process the update through Telegraf
      await this.bot.handleUpdate(update);

      this.logger.log(`✅ Successfully processed update`);
      return { ok: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`❌ Webhook error: ${errorMessage}`);
      return { ok: false, error: errorMessage };
    }
  }
}
