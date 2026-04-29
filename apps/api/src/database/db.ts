import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://onsflow:secret@localhost:5432/onsflow_dev';

const client = postgres(connectionString);

export const db = drizzle(client);
