import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { FindMatchDto } from './dto/find-match.dto';

@Injectable()
export class MatchmakingService {
	constructor(@Inject('DATABASE_POOL') private readonly db: Pool) {}

	async findMatch(dto: FindMatchDto) {
		const teamResult = await this.db.query('SELECT * FROM teams WHERE id = $1', [
			dto.teamId,
		]);

		if (teamResult.rows.length === 0) {
			throw new NotFoundException('Team not found');
		}

		const team = teamResult.rows[0];

		const result = await this.db.query(
			`SELECT *
			 FROM teams
			 WHERE id <> $1
			 ORDER BY ABS(elo - $2) ASC
			 LIMIT 1`,
			[team.id, team.elo],
		);

		if (result.rows.length === 0) {
			return { message: 'No suitable opponent found' };
		}

		return {
			team,
			opponent: result.rows[0],
		};
	}
}
