import { createFileRoute } from '@tanstack/react-router'
import { prisma } from '@/lib/prisma'

export const Route = createFileRoute('/api/projects/$projectId/logs')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { projectId } = params

        const logs = await prisma.log.findMany({
          where: {
            projectId,
          },
          orderBy: {
            createdAt: 'desc',
          },
        })

        return new Response(JSON.stringify(logs), {
          headers: {
            'Content-Type': 'application/json',
          },
        })
      },
      DELETE: async ({ params }) => {
        const { projectId } = params

        const logs = await prisma.log.deleteMany({
          where: {
            projectId,
          },
        })

        return new Response(JSON.stringify(logs), {
          headers: {
            'Content-Type': 'application/json',
          },
        })
      },
    },
  },
})
