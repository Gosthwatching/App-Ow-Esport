import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common'
import { TrainingsService } from './trainings.service'
import { CreateTrainingDto } from './dto/create-training.dto'
import { Roles } from '../security/roles.decorator'

@Controller('trainings')
export class TrainingsController {
  constructor(private readonly service: TrainingsService) {}

  @Get()
  getAll() {
    return this.service.getAll()
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.getOne(id)
  }

  @Post()
  @Roles('coach', 'manager')
  create(@Body() dto: CreateTrainingDto) {
    return this.service.create(dto)
  }

  @Delete(':id')
  @Roles('coach', 'manager')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id)
  }
}
