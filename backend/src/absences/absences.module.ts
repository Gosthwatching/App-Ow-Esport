import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database.module'
import { AbsencesController } from './absences.controller'
import { AbsencesService } from './absences.service'

@Module({
  imports: [DatabaseModule],
  controllers: [AbsencesController],
  providers: [AbsencesService],
})
export class AbsencesModule {}
