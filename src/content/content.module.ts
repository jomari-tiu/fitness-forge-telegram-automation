import { Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}
