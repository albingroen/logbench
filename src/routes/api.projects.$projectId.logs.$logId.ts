import { createFileRoute } from '@tanstack/react-router'
import { prisma } from '@/lib/prisma'

export const Route = createFileRoute('/api/projects/$projectId/logs/$logId')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { logId } = params

        const log = await prisma.log.findUnique({
          where: {
            id: logId,
          },
        })

        return new Response(JSON.stringify(log), {
          headers: {
            'Content-Type': 'application/json',
          },
        })
      },
      DELETE: async ({ params }) => {
        const { logId } = params

        const log = await prisma.log.delete({
          where: {
            id: logId,
          },
        })

        return new Response(JSON.stringify(log), {
          headers: {
            'Content-Type': 'application/json',
          },
        })
      },
    },
  },
})
