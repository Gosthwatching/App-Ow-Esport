import { Injectable, Inject } from '@nestjs/common'
import { Pool } from 'pg'
import { CreateCoachingSessionDto } from './dto/create-coaching-session.dto'
import type { AuthenticatedUser } from '../auth/authenticated-user.interface'
import { normalizeRole } from '../security/role-hierarchy'

@Injectable()
export class CoachingSessionsService {
  constructor(@Inject('DATABASE_POOL') private db: Pool) {}

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
    )

    return result.rows.map((row) => Number(row.team_id)).filter(Boolean)
  }

  async getAll(actor: AuthenticatedUser) {
    const normalizedRole = normalizeRole(actor.role)

    if (normalizedRole === 'owner' || normalizedRole === 'ceo' || normalizedRole === 'manager_pole_ow') {
      const result = await this.db.query(
        `SELECT * FROM coaching_sessions ORDER BY scheduled_at DESC`
      )
      return result.rows
    }

    const visibleTeamIds = await this.getVisibleTeamIds(actor)

    if (!visibleTeamIds.length) {
      return []
    }

    const result = await this.db.query(
      `SELECT *
       FROM coaching_sessions
       WHERE team_id = ANY($1::int[])
          OR coach_id = $2
       ORDER BY scheduled_at DESC`,
      [visibleTeamIds, actor.sub]
    )
    return result.rows
  }

  async getOne(id: number, actor: AuthenticatedUser) {
    const sessions = await this.getAll(actor)
    const session = sessions.find((item) => item.id === id)
    return session
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
