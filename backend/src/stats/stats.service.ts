import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class StatsService {
	constructor(@Inject('DATABASE_POOL') private readonly db: Pool) {}

	async getTeamStats(teamId: number) {
		const teamResult = await this.db.query('SELECT * FROM teams WHERE id = $1', [
			teamId,
		]);

		if (teamResult.rows.length === 0) {
			throw new NotFoundException('Team not found');
		}

		const totalScrimsResult = await this.db.query(
			`SELECT COUNT(*) AS total
			 FROM scrims
			 WHERE team1_id = $1 OR team2_id = $1`,
			[teamId],
		);

		const winsResult = await this.db.query(
			`SELECT COUNT(*) AS wins
			 FROM scrims
			 WHERE winner_team_id = $1`,
			[teamId],
		);

		const total = Number(totalScrimsResult.rows[0].total);
		const wins = Number(winsResult.rows[0].wins);
		const losses = total - wins;
		const winrate = total > 0 ? (wins / total) * 100 : 0;

		return {
			team: teamResult.rows[0],
			totalScrims: total,
			wins,
			losses,
			winrate,
		};
	}

	async getPlayerStats(playerId: number) {
		const playerResult = await this.db.query('SELECT * FROM players WHERE id = $1', [
			playerId,
		]);

		if (playerResult.rows.length === 0) {
			throw new NotFoundException('Player not found');
		}

		const player = playerResult.rows[0];

		if (!player.team_id) {
			return {
				player,
				message: 'Player has no team, no team-based stats available',
			};
		}

		const teamStats = await this.getTeamStats(player.team_id);

		return {
			player,
			teamStats,
		};
	}
}
