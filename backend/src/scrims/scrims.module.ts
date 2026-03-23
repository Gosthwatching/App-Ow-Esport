import { Module } from '@nestjs/common';
import { ScrimsController } from './scrims.controller';
import { ScrimsService } from './scrims.service';
import { DatabaseModule } from '../database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ScrimsController],
  providers: [ScrimsService],
})
export class ScrimsModule {}
