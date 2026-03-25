import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { CreateScrimDto } from './dto/create-scrim.dto';
import { UpdateScrimScoreDto } from './dto/update-scrim-score.dto';
import type { AuthenticatedUser } from '../auth/authenticated-user.interface';
import { normalizeRole } from '../security/role-hierarchy';

@Injectable()
export class ScrimsService {
	constructor(@Inject('DATABASE_POOL') private readonly db: Pool) {}

	private async getTeamMapPoolCoverage(teamId: number) {
		const linkedPlayersResult = await this.db.query(
			`SELECT COUNT(DISTINCT p.id)::int AS count
			 FROM players p
			 JOIN app_users u
				ON LOWER(u.username) = LOWER(p.pseudo)
				OR LOWER(COALESCE(u.display_name, '')) = LOWER(p.pseudo)
				OR LOWER(COALESCE(u.faceit_nickname, '')) = LOWER(p.pseudo)
			 WHERE p.team_id = $1`,
			[teamId],
		);

		const pooledMapsResult = await this.db.query(
			`SELECT COUNT(DISTINCT ump.map_id)::int AS count
			 FROM players p
			 JOIN app_users u
				ON LOWER(u.username) = LOWER(p.pseudo)
				OR LOWER(COALESCE(u.display_name, '')) = LOWER(p.pseudo)
				OR LOWER(COALESCE(u.faceit_nickname, '')) = LOWER(p.pseudo)
			 JOIN user_map_pools ump ON ump.user_id = u.id
			 WHERE p.team_id = $1`,
			[teamId],
		);

		return {
			linkedPlayersCount: linkedPlayersResult.rows[0]?.count ?? 0,
			pooledMapsCount: pooledMapsResult.rows[0]?.count ?? 0,
		};
	}

	private async getAllMaps() {
		const result = await this.db.query(
			`SELECT id, name, type, code, image_url
			 FROM maps
			 ORDER BY type ASC, name ASC`,
		);

		return result.rows;
	}

	private async getVisibleTeamIds(actor: AuthenticatedUser) {
		const result = await this.db.query(
			`SELECT DISTINCT team_id
			 FROM (
				SELECT p.team_id
				FROM app_users u
				JOIN players p
					ON LOWER(u.username) = LOWER(p.pseudo)
					OR LOWER(COALESCE(u.display_name, '')) = LOWER(p.pseudo)
					OR LOWER(COALESCE(u.faceit_nickname, '')) = LOWER(p.pseudo)
				WHERE u.id = $1
					AND p.team_id IS NOT NULL

				UNION

				SELECT cs.team_id
				FROM coaching_sessions cs
				WHERE cs.coach_id = $1
					AND cs.team_id IS NOT NULL
			 ) visible_teams
			 WHERE team_id IS NOT NULL`,
			[actor.sub],
		);

		return result.rows.map((row) => Number(row.team_id)).filter(Boolean);
	}

	private async getVisibleScrimQuery(actor: AuthenticatedUser) {
		const normalizedRole = normalizeRole(actor.role);
		const baseQuery = `SELECT s.*,
								t1.name AS team1_name,
								COALESCE(t2.name, s.details->>'opponentTeamName') AS team2_name
						 FROM scrims s
						 LEFT JOIN teams t1 ON s.team1_id = t1.id
						 LEFT JOIN teams t2 ON s.team2_id = t2.id`;

		if (normalizedRole === 'owner' || normalizedRole === 'ceo' || normalizedRole === 'manager_pole_ow') {
			return {
				query: baseQuery,
				params: [] as unknown[],
				hasWhere: false,
			};
		}

		const visibleTeamIds = await this.getVisibleTeamIds(actor);

		if (!visibleTeamIds.length) {
			return {
				query: `${baseQuery} WHERE 1 = 0`,
				params: [] as unknown[],
				hasWhere: true,
			};
		}

		return {
			query: `${baseQuery} WHERE s.team1_id = ANY($1::int[]) OR s.team2_id = ANY($1::int[])`,
			params: [visibleTeamIds] as unknown[],
			hasWhere: true,
		};
	}

	async getEligibleMaps(team1Id: number, team2Id: number) {
		if (team1Id === team2Id) {
			throw new BadRequestException('A scrim requires two different teams');
		}

		const teamsResult = await this.db.query(
			`SELECT id, name
			 FROM teams
			 WHERE id = ANY($1::int[])`,
			[[team1Id, team2Id]],
		);

		if (teamsResult.rows.length !== 2) {
			throw new BadRequestException('Both teams must exist');
		}

		const [team1Coverage, team2Coverage] = await Promise.all([
			this.getTeamMapPoolCoverage(team1Id),
			this.getTeamMapPoolCoverage(team2Id),
		]);

		const restrictionActive =
			team1Coverage.linkedPlayersCount > 0 &&
			team2Coverage.linkedPlayersCount > 0 &&
			team1Coverage.pooledMapsCount > 0 &&
			team2Coverage.pooledMapsCount > 0;

		if (!restrictionActive) {
			return {
				restrictionActive: false,
				reason:
					'At least one team has no linked players or no player-specific map pool yet, so all maps remain available.',
				teams: teamsResult.rows,
				maps: await this.getAllMaps(),
			};
		}

		const sharedMapsResult = await this.db.query(
			`SELECT m.id,
					m.name,
					m.type,
					m.code,
					m.image_url,
					COUNT(DISTINCT p1.id)::int AS team1_player_count,
					COUNT(DISTINCT p2.id)::int AS team2_player_count,
					ARRAY_REMOVE(ARRAY_AGG(DISTINCT p1.pseudo), NULL) AS team1_players,
					ARRAY_REMOVE(ARRAY_AGG(DISTINCT p2.pseudo), NULL) AS team2_players
			 FROM maps m
			 JOIN user_map_pools ump1 ON ump1.map_id = m.id
			 JOIN app_users u1 ON u1.id = ump1.user_id
			 JOIN players p1
				ON p1.team_id = $1
				AND (
					LOWER(u1.username) = LOWER(p1.pseudo)
					OR LOWER(COALESCE(u1.display_name, '')) = LOWER(p1.pseudo)
					OR LOWER(COALESCE(u1.faceit_nickname, '')) = LOWER(p1.pseudo)
				)
			 JOIN user_map_pools ump2 ON ump2.map_id = m.id
			 JOIN app_users u2 ON u2.id = ump2.user_id
			 JOIN players p2
				ON p2.team_id = $2
				AND (
					LOWER(u2.username) = LOWER(p2.pseudo)
					OR LOWER(COALESCE(u2.display_name, '')) = LOWER(p2.pseudo)
					OR LOWER(COALESCE(u2.faceit_nickname, '')) = LOWER(p2.pseudo)
				)
			 GROUP BY m.id, m.name, m.type, m.code, m.image_url
			 ORDER BY m.type ASC, m.name ASC`,
			[team1Id, team2Id],
		);

		return {
			restrictionActive: true,
			reason:
				sharedMapsResult.rows.length === 0
					? 'No shared map exists between the two team map pools.'
					: null,
			teams: teamsResult.rows,
			maps: sharedMapsResult.rows,
			coverage: {
				team1: team1Coverage,
				team2: team2Coverage,
			},
		};
	}

	async getAll(actor: AuthenticatedUser) {
		const visibleQuery = await this.getVisibleScrimQuery(actor);
		const result = await this.db.query(
			`${visibleQuery.query} ORDER BY s.scheduled_at DESC`,
			visibleQuery.params,
		);
		return result.rows;
	}

	async getOne(id: number, actor: AuthenticatedUser) {
		const visibleQuery = await this.getVisibleScrimQuery(actor);
		const scrimResult = await this.db.query(
			`${visibleQuery.query} ${visibleQuery.hasWhere ? 'AND' : 'WHERE'} s.id = $${visibleQuery.params.length + 1}`,
			[...visibleQuery.params, id],
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

	async create(dto: CreateScrimDto, actor?: AuthenticatedUser) {
		let team1Id = dto.team1Id;
		let team2Id: number | undefined = dto.team2Id;
		const details = { ...(dto.details ?? {}) } as Record<string, unknown>;
		const opponentTeamName = dto.opponentTeamName?.trim();
		const opponentRoster = dto.opponentRoster?.trim();

		if (dto.opponentTeamId !== undefined || opponentTeamName) {
			if (!actor?.sub) {
				throw new BadRequestException('Authenticated user is required for simplified scrim creation');
			}

			const actorTeamResult = await this.db.query(
				`SELECT p.team_id
				 FROM app_users u
				 JOIN players p
					ON LOWER(u.username) = LOWER(p.pseudo)
					OR LOWER(COALESCE(u.display_name, '')) = LOWER(p.pseudo)
					OR LOWER(COALESCE(u.faceit_nickname, '')) = LOWER(p.pseudo)
				 WHERE u.id = $1
					 AND p.team_id IS NOT NULL
				 LIMIT 1`,
				[actor.sub],
			);

			const actorTeamId = actorTeamResult.rows[0]?.team_id as number | undefined;
			if (!actorTeamId) {
				throw new BadRequestException('No team linked to your account. Ask an admin to link your user to a player/team.');
			}

			team1Id = actorTeamId;
			team2Id = dto.opponentTeamId;

			if (opponentTeamName) {
				details.opponentTeamName = opponentTeamName;
			}
			if (opponentRoster) {
				details.opponentRoster = opponentRoster;
			}
		}

		if (!team1Id) {
			throw new BadRequestException('Team 1 must be provided');
		}

		if (!team2Id && !opponentTeamName) {
			throw new BadRequestException('Provide either opponentTeamId or opponentTeamName');
		}

		const format = dto.format?.trim() || 'BO5';
		const scheduledAt = dto.scheduledAt ?? new Date().toISOString();

		let maps = dto.maps;
		if ((!maps || maps.length === 0) && team2Id) {
			const eligibleMaps = await this.getEligibleMaps(team1Id, team2Id);
			if (!eligibleMaps.maps.length) {
				throw new BadRequestException('No available map for this matchup');
			}

			maps = eligibleMaps.maps.slice(0, 3).map((m, idx) => ({
				mapId: Number(m.id),
				order: idx + 1,
			}));
		}

		if (team2Id && maps && maps.length > 0) {
			const eligibleMaps = await this.getEligibleMaps(team1Id, team2Id);
			if (eligibleMaps.restrictionActive) {
				const allowedMapIds = new Set<number>(eligibleMaps.maps.map((map) => map.id as number));
				const invalidMapIds = maps
					.map((map) => map.mapId)
					.filter((mapId) => !allowedMapIds.has(mapId));

				if (invalidMapIds.length > 0) {
					throw new BadRequestException(
						`These maps are outside the shared player map pool for this scrim: ${invalidMapIds.join(', ')}`,
					);
				}
			}
		}

		const client = await this.db.connect();
		try {
			await client.query('BEGIN');

			const scrimResult = await client.query(
				`INSERT INTO scrims (team1_id, team2_id, scheduled_at, format, details)
				 VALUES ($1, $2, $3, $4, $5::jsonb)
				 RETURNING id`,
				[team1Id, team2Id ?? null, scheduledAt, format, JSON.stringify(details)],
			);

			const scrimId = scrimResult.rows[0].id;

			for (const m of maps ?? []) {
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
