import { readFile, readdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
import { createClient } from '@libsql/client'

export async function migrate() {
  const url = process.env.DATABASE_URL || 'file:./dev.db'
  const client = createClient({ url })

  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS _prisma_migrations (
        id TEXT PRIMARY KEY,
        checksum TEXT NOT NULL,
        finished_at TEXT,
        migration_name TEXT NOT NULL,
        logs TEXT,
        rolled_back_at TEXT,
        started_at TEXT NOT NULL DEFAULT (datetime('now')),
        applied_steps_count INTEGER NOT NULL DEFAULT 0
      )
    `)

    const result = await client.execute(
      'SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL',
    )
    const applied = new Set(result.rows.map((r) => r.migration_name as string))

    const migrationsDir = join(process.cwd(), 'prisma', 'migrations')
    const entries = await readdir(migrationsDir, { withFileTypes: true })
    const pending = entries
      .filter((e) => e.isDirectory() && !applied.has(e.name))
      .map((e) => e.name)
      .sort()

    for (const name of pending) {
      const sql = await readFile(
        join(migrationsDir, name, 'migration.sql'),
        'utf-8',
      )
      const checksum = createHash('sha256').update(sql).digest('hex')

      await client.executeMultiple(sql)
      await client.execute({
        sql: `INSERT INTO _prisma_migrations (id, checksum, migration_name, finished_at, applied_steps_count)
              VALUES (hex(randomblob(16)), ?, ?, datetime('now'), 1)`,
        args: [checksum, name],
      })

      console.log(`logbench: applied migration ${name}`)
    }
  } finally {
    client.close()
  }
}
