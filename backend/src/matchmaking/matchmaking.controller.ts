import { Body, Controller, Post } from '@nestjs/common';
import { MatchmakingService } from './matchmaking.service';
import { FindMatchDto } from './dto/find-match.dto';
import { Roles } from '../security/roles.decorator';

@Controller('matchmaking')
export class MatchmakingController {
	constructor(private readonly matchmakingService: MatchmakingService) {}

	@Post('find')
	@Roles('admin')
	findMatch(@Body() dto: FindMatchDto) {
		return this.matchmakingService.findMatch(dto);
	}
}
