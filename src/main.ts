import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn'], // Enable more logging for debugging
  });

  // Enable graceful shutdown
  app.enableShutdownHooks();

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Application is running on port ${port}`);
  console.log(
    `🔗 Webhook URL: https://fitness-forge-telegram-automation.onrender.com/telegram`,
  );
  console.log(
    `🤖 Bot Token: ${process.env.TELEGRAM_BOT_TOKEN ? 'SET' : 'NOT SET'}`,
  );
  console.log(
    `🌐 Webhook Domain: ${process.env.TELEGRAM_WEBHOOK_DOMAIN || 'NOT SET'}`,
  );
  console.log(`🏗️ Environment: ${process.env.NODE_ENV}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
