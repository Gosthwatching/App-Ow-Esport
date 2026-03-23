import { Module } from '@nestjs/common';
import { PlayersService } from './players.service';
import { PlayersController } from './players.controller';
import { DatabaseModule } from '../database.module';

@Module({
  imports: [DatabaseModule],
  providers: [PlayersService],
  controllers: [PlayersController]
})
export class PlayersModule {}
