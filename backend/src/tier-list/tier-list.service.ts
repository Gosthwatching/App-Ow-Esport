import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { CreateTierListUserDto } from './dto/create-tier-list-user.dto';
import { UpsertTierEntryDto } from './dto/upsert-tier-entry.dto';

@Injectable()
export class TierListService {
	constructor(@Inject('DATABASE_POOL') private readonly db: Pool) {}

	async findUserByPseudo(pseudo: string) {
		const result = await this.db.query(
			`SELECT id, username, display_name AS "displayName"
			 FROM app_users
			 WHERE LOWER(username) = LOWER($1)
				OR LOWER(display_name) = LOWER($1)
			 LIMIT 1`,
			[pseudo],
		);

		if (result.rows.length === 0) {
			throw new NotFoundException('User not found for this pseudo');
		}

		return result.rows[0] as {
			id: number;
			username: string;
			displayName: string | null;
		};
	}

	async createUser(dto: CreateTierListUserDto) {
		const result = await this.db.query(
			`INSERT INTO app_users (username, display_name)
			 VALUES ($1, $2)
			 RETURNING id, username, display_name`,
			[dto.username, dto.displayName ?? null],
		);

		return {
			message: 'User created',
			user: result.rows[0],
		};
	}

	async getUserHeroTiers(userId: number, role?: string) {
		const userExists = await this.db.query('SELECT id FROM app_users WHERE id = $1', [
			userId,
		]);

		if (userExists.rows.length === 0) {
			throw new NotFoundException('User not found');
		}

		const values: Array<number | string> = [userId];
		let roleFilter = '';

		if (role) {
			values.push(role);
			roleFilter = `AND h.role = $${values.length}`;
		}

		const result = await this.db.query(
			`SELECT h.id,
							h.name,
							h.role,
							h.code,
							h.image_url,
							uht.tier
			 FROM heroes h
			 LEFT JOIN user_hero_tiers uht
				 ON uht.hero_id = h.id
				AND uht.user_id = $1
			 WHERE 1 = 1 ${roleFilter}
			 ORDER BY h.role ASC, h.name ASC`,
			values,
		);

		return result.rows;
	}

	async getUserTierListGrouped(userId: number, role?: string) {
		const rows = await this.getUserHeroTiers(userId, role);

		const grouped = {
			S: [] as typeof rows,
			A: [] as typeof rows,
			B: [] as typeof rows,
			C: [] as typeof rows,
			D: [] as typeof rows,
			Unranked: [] as typeof rows,
		};

		for (const hero of rows) {
			const key = hero.tier ?? 'Unranked';
			grouped[key].push(hero);
		}

		return grouped;
	}

	async upsertTier(userId: number, heroId: number, dto: UpsertTierEntryDto) {
		const userExists = await this.db.query('SELECT id FROM app_users WHERE id = $1', [
			userId,
		]);
		if (userExists.rows.length === 0) {
			throw new NotFoundException('User not found');
		}

		const heroExists = await this.db.query('SELECT id FROM heroes WHERE id = $1', [
			heroId,
		]);
		if (heroExists.rows.length === 0) {
			throw new NotFoundException('Hero not found');
		}

		await this.db.query(
			`INSERT INTO user_hero_tiers (user_id, hero_id, tier)
			 VALUES ($1, $2, $3)
			 ON CONFLICT (user_id, hero_id)
			 DO UPDATE SET tier = EXCLUDED.tier, updated_at = NOW()`,
			[userId, heroId, dto.tier],
		);

		return { message: 'Tier updated' };
	}

	async removeTier(userId: number, heroId: number) {
		await this.db.query(
			'DELETE FROM user_hero_tiers WHERE user_id = $1 AND hero_id = $2',
			[userId, heroId],
		);

		return { message: 'Tier removed' };
	}

	// ── Map pool ────────────────────────────────────────────────────────────────

	async getUserMapPool(userId: number, type?: string) {
		const userExists = await this.db.query('SELECT id FROM app_users WHERE id = $1', [userId]);
		if (userExists.rows.length === 0) {
			throw new NotFoundException('User not found');
		}

		const values: Array<number | string> = [userId];
		let typeFilter = '';
		if (type) {
			values.push(type);
			typeFilter = `AND m.type = $${values.length}`;
		}

		const result = await this.db.query(
			`SELECT m.id,
					m.name,
					m.type,
					m.code,
					m.image_url,
					(ump.user_id IS NOT NULL) AS in_pool
			 FROM maps m
			 LEFT JOIN user_map_pools ump
				 ON ump.map_id = m.id
				AND ump.user_id = $1
			 WHERE 1 = 1 ${typeFilter}
			 ORDER BY m.type ASC, m.name ASC`,
			values,
		);

		return result.rows;
	}

	async addToMapPool(userId: number, mapId: number) {
		const userExists = await this.db.query('SELECT id FROM app_users WHERE id = $1', [userId]);
		if (userExists.rows.length === 0) {
			throw new NotFoundException('User not found');
		}

		const mapExists = await this.db.query('SELECT id FROM maps WHERE id = $1', [mapId]);
		if (mapExists.rows.length === 0) {
			throw new NotFoundException('Map not found');
		}

		await this.db.query(
			`INSERT INTO user_map_pools (user_id, map_id)
			 VALUES ($1, $2)
			 ON CONFLICT (user_id, map_id) DO NOTHING`,
			[userId, mapId],
		);

		return { message: 'Map added to pool' };
	}

	async removeFromMapPool(userId: number, mapId: number) {
		await this.db.query(
			'DELETE FROM user_map_pools WHERE user_id = $1 AND map_id = $2',
			[userId, mapId],
		);

		return { message: 'Map removed from pool' };
	}

	async getUserMapPoolByPseudo(pseudo: string, type?: string) {
		const targetUser = await this.findUserByPseudo(pseudo);
		const maps = await this.getUserMapPool(targetUser.id, type);
		return {
			userId: targetUser.id,
			username: targetUser.username,
			displayName: targetUser.displayName,
			maps,
		};
	}
}
