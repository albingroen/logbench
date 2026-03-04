import { PrismaLibSql } from '@prisma/adapter-libsql'
import { PrismaClient } from '../../generated/prisma/client'

const adapter = new PrismaLibSql({ url: 'file:./dev.db' })

export const prisma = new PrismaClient({ adapter })
