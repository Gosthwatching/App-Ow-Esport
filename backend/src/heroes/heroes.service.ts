import {
	BadRequestException,
	Inject,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { Pool } from 'pg';
import { CreateHeroDto } from './dto/create-hero.dto';
import { UpdateHeroDto } from './dto/update-hero.dto';

@Injectable()
export class HeroesService {
	constructor(@Inject('DATABASE_POOL') private readonly db: Pool) {}

	async getAll(role?: string) {
		if (role) {
			const result = await this.db.query(
				'SELECT * FROM heroes WHERE role = $1 ORDER BY name ASC',
				[role],
			);
			return result.rows;
		}

		const result = await this.db.query(
			'SELECT * FROM heroes ORDER BY role ASC, name ASC',
		);
		return result.rows;
	}

	async getOne(id: number) {
		const result = await this.db.query('SELECT * FROM heroes WHERE id = $1', [id]);

		if (result.rows.length === 0) {
			throw new NotFoundException('Hero not found');
		}

		return result.rows[0];
	}

	async create(dto: CreateHeroDto) {
		await this.db.query(
			`INSERT INTO heroes (name, role, code, image_url)
			 VALUES ($1, $2, $3, $4)`,
			[dto.name, dto.role, dto.code, dto.imageUrl],
		);

		return { message: 'Hero created' };
	}

	async update(id: number, dto: UpdateHeroDto) {
		const updates: string[] = [];
		const values: string[] = [];

		if (dto.name !== undefined) {
			values.push(dto.name);
			updates.push(`name = $${values.length}`);
		}

		if (dto.role !== undefined) {
			values.push(dto.role);
			updates.push(`role = $${values.length}`);
		}

		if (dto.code !== undefined) {
			values.push(dto.code);
			updates.push(`code = $${values.length}`);
		}

		if (dto.imageUrl !== undefined) {
			values.push(dto.imageUrl);
			updates.push(`image_url = $${values.length}`);
		}

		if (updates.length === 0) {
			throw new BadRequestException('At least one field must be provided');
		}

		values.push(String(id));

		const result = await this.db.query(
			`UPDATE heroes SET ${updates.join(', ')} WHERE id = $${values.length}`,
			values,
		);

		if (result.rowCount === 0) {
			throw new NotFoundException('Hero not found');
		}

		return { message: 'Hero updated' };
	}

	async delete(id: number) {
		const result = await this.db.query('DELETE FROM heroes WHERE id = $1', [id]);

		if (result.rowCount === 0) {
			throw new NotFoundException('Hero not found');
		}

		return { message: 'Hero deleted' };
	}
}
