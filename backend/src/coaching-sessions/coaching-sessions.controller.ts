import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common'
import { CoachingSessionsService } from './coaching-sessions.service'
import { CreateCoachingSessionDto } from './dto/create-coaching-session.dto'
import { Roles } from '../security/roles.decorator'
import { JwtAuthGuard } from '../security/jwt-auth.guard'
import { CurrentUser } from '../security/current-user.decorator'
import type { AuthenticatedUser } from '../auth/authenticated-user.interface'

@Controller('coaching-sessions')
export class CoachingSessionsController {
  constructor(private readonly service: CoachingSessionsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getAll(@CurrentUser() actor: AuthenticatedUser) {
    return this.service.getAll(actor)
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.getOne(id, actor)
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
