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
import { ScrimsService } from './scrims.service';
import { CreateScrimDto } from './dto/create-scrim.dto';
import { UpdateScrimScoreDto } from './dto/update-scrim-score.dto';
import { Roles } from '../security/roles.decorator';
import { CurrentUser } from '../security/current-user.decorator';
import type { AuthenticatedUser } from '../auth/authenticated-user.interface';

@Controller('scrims')
export class ScrimsController {
	constructor(private readonly scrimsService: ScrimsService) {}

	@Get()
	getAll() {
		return this.scrimsService.getAll();
	}

	@Get('eligible-maps/options')
	getEligibleMaps(
		@Query('team1Id', ParseIntPipe) team1Id: number,
		@Query('team2Id', ParseIntPipe) team2Id: number,
	) {
		return this.scrimsService.getEligibleMaps(team1Id, team2Id);
	}

	@Get(':id')
	getOne(@Param('id', ParseIntPipe) id: number) {
		return this.scrimsService.getOne(id);
	}

	@Post()
	@Roles('manager', 'coach', 'admin', 'owner', 'ceo')
	create(
		@Body() dto: CreateScrimDto,
		@CurrentUser() actor: AuthenticatedUser | undefined,
	) {
		return this.scrimsService.create(dto, actor);
	}

	@Put(':id/score')
	@Roles('manager', 'coach', 'admin', 'owner', 'ceo')
	updateScore(
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: UpdateScrimScoreDto,
	) {
		return this.scrimsService.updateScore(id, dto);
	}

	@Delete(':id')
	@Roles('manager', 'coach', 'admin', 'owner', 'ceo')
	delete(@Param('id', ParseIntPipe) id: number) {
		return this.scrimsService.delete(id);
	}
}
