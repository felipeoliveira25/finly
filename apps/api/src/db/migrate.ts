import { migrate } from 'drizzle-orm/libsql/migrator'
import { db } from './client'
import path from 'path'

const MIGRATIONS_FOLDER = path.resolve(__dirname, './migrations')

export async function runMigrations(): Promise<void> {
  console.log('[db] Running migrations...')
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER })
  console.log('[db] Migrations complete.')
}
