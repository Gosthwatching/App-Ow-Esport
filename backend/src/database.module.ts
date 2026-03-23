import 'dotenv/config';
import { Module } from '@nestjs/common';
import { Pool } from 'pg';

const dbPort = Number(process.env.DB_PORT ?? '5432');

if (Number.isNaN(dbPort)) {
  throw new Error('DB_PORT must be a valid number');
}

export const db = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST ?? 'localhost',
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: dbPort,
});

@Module({
  providers: [
    {
      provide: 'DATABASE_POOL',
      useValue: db,
    },
  ],
  exports: ['DATABASE_POOL'],
})
export class DatabaseModule {}