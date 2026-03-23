import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { CreateMapDto } from './dto/create-map.dto';
import { UpdateMapDto } from './dto/update-map.dto';

@Injectable()
export class MapsService {
	constructor(@Inject('DATABASE_POOL') private readonly db: Pool) {}

	async getAll() {
		const result = await this.db.query(
			'SELECT * FROM maps ORDER BY type ASC, name ASC',
		);
		return result.rows;
	}

	async getOne(id: number) {
		const result = await this.db.query('SELECT * FROM maps WHERE id = $1', [id]);
		return result.rows[0];
	}

	async create(dto: CreateMapDto) {
		await this.db.query(
			`INSERT INTO maps (name, type, country, code, image_url)
			 VALUES ($1, $2, $3, $4, $5)`,
			[dto.name, dto.type, dto.country ?? null, dto.code, dto.imageUrl ?? null],
		);
		return { message: 'Map created' };
	}

	async update(id: number, dto: UpdateMapDto) {
		const updates: string[] = [];
		const values: Array<string | null> = [];

		if (dto.name !== undefined) {
			values.push(dto.name);
			updates.push(`name = $${values.length}`);
		}

		if (dto.type !== undefined) {
			values.push(dto.type);
			updates.push(`type = $${values.length}`);
		}

		if (dto.country !== undefined) {
			values.push(dto.country);
			updates.push(`country = $${values.length}`);
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

		await this.db.query(
			`UPDATE maps SET ${updates.join(', ')} WHERE id = $${values.length}`,
			values,
		);
		return { message: 'Map updated' };
	}

	async delete(id: number) {
		await this.db.query('DELETE FROM maps WHERE id = $1', [id]);
		return { message: 'Map deleted' };
	}
}
