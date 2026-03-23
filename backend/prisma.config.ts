import 'dotenv/config';
import { defineConfig } from '@prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.APP_DB_URL ?? process.env.DATABASE_URL ?? '',
  },
});