import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common'
import { AbsencesService } from './absences.service'
import { CreateAbsenceDto } from './dto/create-absence.dto'
import { Roles } from '../security/roles.decorator'

@Controller('absences')
export class AbsencesController {
  constructor(private readonly service: AbsencesService) {}

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
  create(@Body() dto: CreateAbsenceDto) {
    return this.service.create(dto)
  }

  @Delete(':id')
  @Roles('manager', 'coach')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id)
  }
}
