import type { Project } from 'generated/prisma/browser'

export type ProjectWithLogsCount = Project & { _count: { logs: number } }
