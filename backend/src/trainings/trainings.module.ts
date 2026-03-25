import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database.module'
import { TrainingsController } from './trainings.controller'
import { TrainingsService } from './trainings.service'

@Module({
  imports: [DatabaseModule],
  controllers: [TrainingsController],
  providers: [TrainingsService],
})
export class TrainingsModule {}
