import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
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
    },
  },
})
