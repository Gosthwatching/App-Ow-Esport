import { Module } from '@nestjs/common';
import { TierListController } from './tier-list.controller';
import { TierListService } from './tier-list.service';
import { DatabaseModule } from '../database.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [TierListController],
  providers: [TierListService],
})
export class TierListModule {}
