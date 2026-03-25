import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database.module'
import { CoachingSessionsController } from './coaching-sessions.controller'
import { CoachingSessionsService } from './coaching-sessions.service'

@Module({
  imports: [DatabaseModule],
  controllers: [CoachingSessionsController],
  providers: [CoachingSessionsService],
})
export class CoachingSessionsModule {}
