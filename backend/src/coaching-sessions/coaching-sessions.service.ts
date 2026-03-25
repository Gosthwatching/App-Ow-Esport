import { Injectable, Inject } from '@nestjs/common'
import { Pool } from 'pg'
import { CreateCoachingSessionDto } from './dto/create-coaching-session.dto'

@Injectable()
export class CoachingSessionsService {
  constructor(@Inject('DATABASE_POOL') private db: Pool) {}

  async getAll() {
    const result = await this.db.query(
      `SELECT * FROM coaching_sessions ORDER BY scheduled_at DESC`
    )
    return result.rows
  }

  async getOne(id: number) {
    const result = await this.db.query('SELECT * FROM coaching_sessions WHERE id = $1', [id])
    return result.rows[0]
  }

  async create(dto: CreateCoachingSessionDto) {
    const result = await this.db.query(
      `INSERT INTO coaching_sessions (team_id, coach_id, topic, scheduled_at, duration, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [dto.teamId, dto.coachId, dto.topic, dto.scheduledAt, dto.duration, dto.notes || null]
    )
    return result.rows[0]
  }

  async update(id: number, dto: CreateCoachingSessionDto) {
    const result = await this.db.query(
      `UPDATE coaching_sessions 
       SET team_id = $1, coach_id = $2, topic = $3, scheduled_at = $4, duration = $5, notes = $6
       WHERE id = $7
       RETURNING *`,
      [dto.teamId, dto.coachId, dto.topic, dto.scheduledAt, dto.duration, dto.notes || null, id]
    )
    return result.rows[0]
  }

  async delete(id: number) {
    await this.db.query('DELETE FROM coaching_sessions WHERE id = $1', [id])
  }
}
