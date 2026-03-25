import { Injectable, Inject } from '@nestjs/common'
import { Pool } from 'pg'
import { CreateVODDto } from './dto/create-vod.dto'

@Injectable()
export class VODsService {
  constructor(@Inject('DATABASE_POOL') private db: Pool) {}

  async getAll() {
    const result = await this.db.query(
      `SELECT * FROM vods ORDER BY created_at DESC`
    )
    return result.rows
  }

  async getOne(id: number) {
    const result = await this.db.query('SELECT * FROM vods WHERE id = $1', [id])
    return result.rows[0]
  }

  async create(dto: CreateVODDto) {
    const result = await this.db.query(
      `INSERT INTO vods (created_by, title, description, team1_name, team2_name, team1_score, team2_score, map_name, vod_url, duration)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        dto.createdBy,
        dto.title,
        dto.description || null,
        dto.team1Name || null,
        dto.team2Name || null,
        dto.team1Score || null,
        dto.team2Score || null,
        dto.mapName || null,
        dto.vodUrl,
        dto.duration || null,
      ]
    )
    return result.rows[0]
  }

  async delete(id: number) {
    await this.db.query('DELETE FROM vods WHERE id = $1', [id])
  }
}
