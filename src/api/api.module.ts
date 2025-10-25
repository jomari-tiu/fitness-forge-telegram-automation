import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { InquiryModule } from '../inquiry/inquiry.module';
import { RetryModule } from '../retry/retry.module';
import { DeliveryModule } from '../delivery/delivery.module';

@Module({
  imports: [InquiryModule, RetryModule, DeliveryModule],
  controllers: [ApiController],
})
export class ApiModule {}
