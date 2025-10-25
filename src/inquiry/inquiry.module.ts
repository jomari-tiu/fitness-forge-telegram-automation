import { Module } from '@nestjs/common';
import { InquiryService } from './inquiry.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [InquiryService],
  exports: [InquiryService],
})
export class InquiryModule {}
