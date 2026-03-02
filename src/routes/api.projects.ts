import { createFileRoute } from '@tanstack/react-router'
import { prisma } from '@/lib/prisma'

export const Route = createFileRoute('/api/projects')({
  server: {
    handlers: {
      GET: async () => {
        const projects = await prisma.project.findMany()

        return new Response(JSON.stringify(projects), {
          headers: {
            'Content-Type': 'application/json',
          },
        })
      },
      POST: async ({ request }) => {
        const body = await request.json()

        const project = await prisma.project.create({
          data: {
            title: body.title,
          },
        })

        return new Response(JSON.stringify(project), {
          headers: {
            'Content-Type': 'application/json',
          },
        })
      },
    },
  },
})
