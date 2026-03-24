import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FaceitService } from './faceit.service';
import { FaceitController } from './faceit.controller';
import { DatabaseModule } from '../database.module';

@Module({
  imports: [HttpModule, DatabaseModule],
  controllers: [FaceitController],
  providers: [FaceitService],
  exports: [FaceitService],
})
export class FaceitModule {}
