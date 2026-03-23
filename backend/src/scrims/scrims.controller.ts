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
import { ScrimsService } from './scrims.service';
import { CreateScrimDto } from './dto/create-scrim.dto';
import { UpdateScrimScoreDto } from './dto/update-scrim-score.dto';
import { Roles } from '../security/roles.decorator';

@Controller('scrims')
export class ScrimsController {
	constructor(private readonly scrimsService: ScrimsService) {}

	@Get()
	getAll() {
		return this.scrimsService.getAll();
	}

	@Get(':id')
	getOne(@Param('id', ParseIntPipe) id: number) {
		return this.scrimsService.getOne(id);
	}

	@Post()
	@Roles('admin')
	create(@Body() dto: CreateScrimDto) {
		return this.scrimsService.create(dto);
	}

	@Put(':id/score')
	@Roles('admin')
	updateScore(
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: UpdateScrimScoreDto,
	) {
		return this.scrimsService.updateScore(id, dto);
	}

	@Delete(':id')
	@Roles('admin')
	delete(@Param('id', ParseIntPipe) id: number) {
		return this.scrimsService.delete(id);
	}
}
