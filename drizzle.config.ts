import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  schema: './src/database/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env.DATABASE_URL ||
      'postgresql://neondb_owner:npg_cbSYx6q3Mtwk@ep-holy-fire-a44g93lx-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  },
});
