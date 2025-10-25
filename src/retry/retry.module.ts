import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { RetryService } from './retry.service';
import { InquiryModule } from '../inquiry/inquiry.module';
import { DeliveryModule } from '../delivery/delivery.module';

@Module({
  imports: [ScheduleModule.forRoot(), InquiryModule, DeliveryModule],
  providers: [RetryService],
  exports: [RetryService],
})
export class RetryModule {}
