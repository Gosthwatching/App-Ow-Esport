import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common'
import { VODsService } from './vods.service'
import { CreateVODDto } from './dto/create-vod.dto'
import { Roles } from '../security/roles.decorator'

@Controller('vods')
export class VODsController {
  constructor(private readonly service: VODsService) {}

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
  create(@Body() dto: CreateVODDto) {
    return this.service.create(dto)
  }

  @Delete(':id')
  @Roles('manager', 'coach')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id)
  }
}
