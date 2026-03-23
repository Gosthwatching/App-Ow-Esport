import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
	constructor(private readonly statsService: StatsService) {}

	@Get('teams/:id')
	getTeamStats(@Param('id', ParseIntPipe) id: number) {
		return this.statsService.getTeamStats(id);
	}

	@Get('players/:id')
	getPlayerStats(@Param('id', ParseIntPipe) id: number) {
		return this.statsService.getPlayerStats(id);
	}
}
