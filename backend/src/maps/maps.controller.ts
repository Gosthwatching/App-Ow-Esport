import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Post,
	Put,
} from '@nestjs/common';
import { MapsService } from './maps.service';
import { CreateMapDto } from './dto/create-map.dto';
import { UpdateMapDto } from './dto/update-map.dto';
import { Roles } from '../security/roles.decorator';

@Controller('maps')
export class MapsController {
	constructor(private readonly mapsService: MapsService) {}

	@Get()
	getAll() {
		return this.mapsService.getAll();
	}

	@Get(':id')
	getOne(@Param('id', ParseIntPipe) id: number) {
		return this.mapsService.getOne(id);
	}

	@Post()
	@Roles('admin')
	create(@Body() dto: CreateMapDto) {
		return this.mapsService.create(dto);
	}

	@Put(':id')
	@Roles('admin')
	update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMapDto) {
		return this.mapsService.update(id, dto);
	}

	@Delete(':id')
	@Roles('admin')
	delete(@Param('id', ParseIntPipe) id: number) {
		return this.mapsService.delete(id);
	}
}
