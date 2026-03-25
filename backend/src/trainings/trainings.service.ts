import { Injectable, Inject } from '@nestjs/common'
import { Pool } from 'pg'
import { CreateTrainingDto } from './dto/create-training.dto'

@Injectable()
export class TrainingsService {
  constructor(@Inject('DATABASE_POOL') private db: Pool) {}

  async getAll() {
    const result = await this.db.query(
      `SELECT * FROM trainings ORDER BY created_at DESC`
    )
    return result.rows
  }

  async getOne(id: number) {
    const result = await this.db.query('SELECT * FROM trainings WHERE id = $1', [id])
    return result.rows[0]
  }

  async create(dto: CreateTrainingDto) {
    const result = await this.db.query(
      `INSERT INTO trainings (created_by, title, description, category, content, video_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        dto.createdBy,
        dto.title,
        dto.description || null,
        dto.category,
        dto.content,
        dto.videoUrl || null,
      ]
    )
    return result.rows[0]
  }

  async delete(id: number) {
    await this.db.query('DELETE FROM trainings WHERE id = $1', [id])
  }
}
