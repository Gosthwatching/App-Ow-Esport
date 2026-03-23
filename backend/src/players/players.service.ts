import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';

@Injectable()
export class PlayersService {
  constructor(
    @Inject('DATABASE_POOL') private readonly db: Pool,
  ) {}

  async getAll() {
    const result = await this.db.query('SELECT * FROM players ORDER BY id ASC');
    return result.rows;
  }

  async getOne(id: number) {
    const result = await this.db.query(
      'SELECT * FROM players WHERE id = $1',
      [id],
    );
    return result.rows[0];
  }

  async create(dto: CreatePlayerDto) {
    await this.db.query(
      'INSERT INTO players (pseudo, role, rank, team_id) VALUES ($1, $2, $3, $4)',
      [dto.pseudo, dto.role, dto.rank, dto.teamId ?? null],
    );
    return { message: 'Player created' };
  }

  async update(id: number, dto: UpdatePlayerDto) {
    const updates: string[] = [];
    const values: Array<string | number | null> = [];

    if (dto.pseudo !== undefined) {
      values.push(dto.pseudo);
      updates.push(`pseudo = $${values.length}`);
    }

    if (dto.role !== undefined) {
      values.push(dto.role);
      updates.push(`role = $${values.length}`);
    }

    if (dto.rank !== undefined) {
      values.push(dto.rank);
      updates.push(`rank = $${values.length}`);
    }

    if (dto.teamId !== undefined) {
      values.push(dto.teamId);
      updates.push(`team_id = $${values.length}`);
    }

    if (updates.length === 0) {
      throw new BadRequestException('At least one field must be provided');
    }

    values.push(id);

    await this.db.query(
      `UPDATE players SET ${updates.join(', ')} WHERE id = $${values.length}`,
      values,
    );
    return { message: 'Player updated' };
  }

  async assignTeam(playerId: number, teamId: number) {
    await this.db.query(
      'UPDATE players SET team_id = $1 WHERE id = $2',
      [teamId, playerId],
    );
    return { message: 'Player assigned to team' };
  }

  async removeFromTeam(playerId: number) {
    await this.db.query(
      'UPDATE players SET team_id = NULL WHERE id = $1',
      [playerId],
    );
    return { message: 'Player removed from team' };
  }

  async delete(id: number) {
    await this.db.query('DELETE FROM players WHERE id = $1', [id]);
    return { message: 'Player deleted' };
  }
}