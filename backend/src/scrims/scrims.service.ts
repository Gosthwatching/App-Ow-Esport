import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { CreateScrimDto } from './dto/create-scrim.dto';
import { UpdateScrimScoreDto } from './dto/update-scrim-score.dto';

@Injectable()
export class ScrimsService {
	constructor(@Inject('DATABASE_POOL') private readonly db: Pool) {}

	async getAll() {
		const result = await this.db.query(
			`SELECT s.*,
							t1.name AS team1_name,
							t2.name AS team2_name
			 FROM scrims s
			 JOIN teams t1 ON s.team1_id = t1.id
			 JOIN teams t2 ON s.team2_id = t2.id
			 ORDER BY s.scheduled_at DESC`,
		);
		return result.rows;
	}

	async getOne(id: number) {
		const scrimResult = await this.db.query(
			`SELECT s.*,
							t1.name AS team1_name,
							t2.name AS team2_name
			 FROM scrims s
			 JOIN teams t1 ON s.team1_id = t1.id
			 JOIN teams t2 ON s.team2_id = t2.id
			 WHERE s.id = $1`,
			[id],
		);

		if (scrimResult.rows.length === 0) {
			return null;
		}

		const mapsResult = await this.db.query(
			`SELECT sm.map_order,
							m.id AS map_id,
							m.name AS map_name,
							m.type AS map_type,
							m.code AS map_code
			 FROM scrim_maps sm
			 JOIN maps m ON sm.map_id = m.id
			 WHERE sm.scrim_id = $1
			 ORDER BY sm.map_order ASC`,
			[id],
		);

		return {
			...scrimResult.rows[0],
			maps: mapsResult.rows,
		};
	}

	async create(dto: CreateScrimDto) {
		if (!dto.maps || dto.maps.length === 0) {
			throw new BadRequestException('At least one map must be provided');
		}

		const client = await this.db.connect();
		try {
			await client.query('BEGIN');

			const scrimResult = await client.query(
				`INSERT INTO scrims (team1_id, team2_id, scheduled_at, format)
				 VALUES ($1, $2, $3, $4)
				 RETURNING id`,
				[dto.team1Id, dto.team2Id, dto.scheduledAt, dto.format],
			);

			const scrimId = scrimResult.rows[0].id;

			for (const m of dto.maps) {
				await client.query(
					`INSERT INTO scrim_maps (scrim_id, map_id, map_order)
					 VALUES ($1, $2, $3)`,
					[scrimId, m.mapId, m.order],
				);
			}

			await client.query('COMMIT');
			return { message: 'Scrim created', id: scrimId };
		} catch (e) {
			await client.query('ROLLBACK');
			throw e;
		} finally {
			client.release();
		}
	}

	async updateScore(id: number, dto: UpdateScrimScoreDto) {
		const { scoreTeam1, scoreTeam2 } = dto;

		let winnerTeamId: number | null = null;

		if (scoreTeam1 > scoreTeam2) {
			const res = await this.db.query('SELECT team1_id FROM scrims WHERE id = $1', [id]);
			winnerTeamId = res.rows[0]?.team1_id ?? null;
		} else if (scoreTeam2 > scoreTeam1) {
			const res = await this.db.query('SELECT team2_id FROM scrims WHERE id = $1', [id]);
			winnerTeamId = res.rows[0]?.team2_id ?? null;
		}

		await this.db.query(
			`UPDATE scrims
			 SET score_team1 = $1,
					 score_team2 = $2,
					 winner_team_id = $3
			 WHERE id = $4`,
			[scoreTeam1, scoreTeam2, winnerTeamId, id],
		);

		return { message: 'Scrim score updated' };
	}

	async delete(id: number) {
		await this.db.query('DELETE FROM scrims WHERE id = $1', [id]);
		return { message: 'Scrim deleted' };
	}
}
