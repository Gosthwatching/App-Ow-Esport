import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common'
import { CoachingSessionsService } from './coaching-sessions.service'
import { CreateCoachingSessionDto } from './dto/create-coaching-session.dto'
import { Roles } from '../security/roles.decorator'

@Controller('coaching-sessions')
export class CoachingSessionsController {
  constructor(private readonly service: CoachingSessionsService) {}

  @Get()
  getAll() {
    return this.service.getAll()
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.getOne(id)
  }

  @Post()
  @Roles('manager', 'coach')
  create(@Body() dto: CreateCoachingSessionDto) {
    return this.service.create(dto)
  }

  @Put(':id')
  @Roles('manager', 'coach')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateCoachingSessionDto) {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  @Roles('manager', 'coach')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id)
  }
}
