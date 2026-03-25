import { Injectable, Inject } from '@nestjs/common'
import { Pool } from 'pg'
import { CreateAbsenceDto } from './dto/create-absence.dto'

@Injectable()
export class AbsencesService {
  constructor(@Inject('DATABASE_POOL') private db: Pool) {}

  async getAll() {
    const result = await this.db.query(
      `SELECT * FROM absences ORDER BY start_date ASC`
    )
    return result.rows
  }

  async getOne(id: number) {
    const result = await this.db.query('SELECT * FROM absences WHERE id = $1', [id])
    return result.rows[0]
  }

  async create(dto: CreateAbsenceDto) {
    const result = await this.db.query(
      `INSERT INTO absences (player_id, team_id, start_date, end_date, reason)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [dto.playerId, dto.teamId || null, dto.startDate, dto.endDate, dto.reason || null]
    )
    return result.rows[0]
  }

  async delete(id: number) {
    await this.db.query('DELETE FROM absences WHERE id = $1', [id])
  }
}
