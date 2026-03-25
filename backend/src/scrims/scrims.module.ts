import { Module } from '@nestjs/common';
import { ScrimsController } from './scrims.controller';
import { ScrimsService } from './scrims.service';
import { DatabaseModule } from '../database.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [ScrimsController],
  providers: [ScrimsService],
})
export class ScrimsModule {}
