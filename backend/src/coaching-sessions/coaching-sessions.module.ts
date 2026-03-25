import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database.module'
import { AuthModule } from '../auth/auth.module'
import { CoachingSessionsController } from './coaching-sessions.controller'
import { CoachingSessionsService } from './coaching-sessions.service'

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [CoachingSessionsController],
  providers: [CoachingSessionsService],
})
export class CoachingSessionsModule {}
