import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Post,
	Put,
	Query,
} from '@nestjs/common';
import { HeroesService } from './heroes.service';
import { CreateHeroDto } from './dto/create-hero.dto';
import { UpdateHeroDto } from './dto/update-hero.dto';
import { Roles } from '../security/roles.decorator';

@Controller('heroes')
export class HeroesController {
	constructor(private readonly heroesService: HeroesService) {}

	@Get()
	getAll(@Query('role') role?: string) {
		return this.heroesService.getAll(role);
	}

	@Get(':id')
	getOne(@Param('id', ParseIntPipe) id: number) {
		return this.heroesService.getOne(id);
	}

	@Post()
	@Roles('admin')
	create(@Body() dto: CreateHeroDto) {
		return this.heroesService.create(dto);
	}

	@Put(':id')
	@Roles('admin')
	update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateHeroDto) {
		return this.heroesService.update(id, dto);
	}

	@Delete(':id')
	@Roles('admin')
	delete(@Param('id', ParseIntPipe) id: number) {
		return this.heroesService.delete(id);
	}
}
