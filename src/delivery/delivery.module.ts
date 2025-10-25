import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DeliveryService } from './delivery.service';

@Module({
  imports: [ConfigModule],
  providers: [DeliveryService],
  exports: [DeliveryService],
})
export class DeliveryModule {}
