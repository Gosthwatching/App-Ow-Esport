import { Module } from '@nestjs/common';
import { PlayersService } from './players.service';
import { PlayersController } from './players.controller';
import { DatabaseModule } from '../database.module';
import { FaceitModule } from '../faceit/faceit.module';

@Module({
  imports: [DatabaseModule, FaceitModule],
  providers: [PlayersService],
  controllers: [PlayersController],
})
export class PlayersModule {}
