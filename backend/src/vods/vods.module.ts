import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database.module'
import { VODsController } from './vods.controller'
import { VODsService } from './vods.service'

@Module({
  imports: [DatabaseModule],
  controllers: [VODsController],
  providers: [VODsService],
})
export class VODsModule {}
