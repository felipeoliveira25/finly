import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'
import path from 'path'

const DATABASE_PATH = process.env.DATABASE_PATH ?? './src/db/database.sqlite'

const client = createClient({
  url: `file:${path.resolve(DATABASE_PATH)}`,
})

export const db = drizzle(client, { schema })
