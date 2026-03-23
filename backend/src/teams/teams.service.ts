import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Pool } from 'pg';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(
    @Inject('DATABASE_POOL') private readonly db: Pool,
  ) {}

  private normalizeSlug(value: string) {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/^dragon'?s\s+/i, '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async findTeamByIdentifier(teamIdentifier: string) {
    const result = await this.db.query(
      'SELECT * FROM teams WHERE id::text = $1 OR LOWER(slug) = LOWER($1) LIMIT 1',
      [teamIdentifier],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Team not found');
    }

    return result.rows[0];
  }

  async getAll() {
    const result = await this.db.query(
      'SELECT * FROM teams ORDER BY elo DESC, name ASC',
    );
    return result.rows;
  }

  async getOne(teamIdentifier: string) {
    return this.findTeamByIdentifier(teamIdentifier);
  }

  async getPlayers(teamIdentifier: string) {
    const team = await this.findTeamByIdentifier(teamIdentifier);
    const result = await this.db.query(
      'SELECT * FROM players WHERE team_id = $1 ORDER BY id ASC',
      [team.id],
    );
    return result.rows;
  }

  async create(dto: CreateTeamDto) {
    const slug = this.normalizeSlug(dto.slug ?? dto.name);

    await this.db.query(
      'INSERT INTO teams (name, slug, elo) VALUES ($1, $2, $3)',
      [dto.name, slug, dto.elo ?? 1000],
    );
    return { message: 'Team created' };
  }

  async update(teamIdentifier: string, dto: UpdateTeamDto) {
    const team = await this.findTeamByIdentifier(teamIdentifier);
    const updates: string[] = [];
    const values: Array<string | number> = [];

    if (dto.name !== undefined) {
      values.push(dto.name);
      updates.push(`name = $${values.length}`);
    }

    if (dto.slug !== undefined || dto.name !== undefined) {
      values.push(this.normalizeSlug(dto.slug ?? dto.name ?? team.slug));
      updates.push(`slug = $${values.length}`);
    }

    if (dto.elo !== undefined) {
      values.push(dto.elo);
      updates.push(`elo = $${values.length}`);
    }

    if (updates.length === 0) {
      throw new BadRequestException('At least one field must be provided');
    }

    values.push(team.id);

    await this.db.query(
      `UPDATE teams SET ${updates.join(', ')} WHERE id = $${values.length}`,
      values,
    );
    return { message: 'Team updated' };
  }

  async delete(teamIdentifier: string) {
    const team = await this.findTeamByIdentifier(teamIdentifier);

    await this.db.query('DELETE FROM teams WHERE id = $1', [team.id]);
    return { message: 'Team deleted' };
  }
}