import { createFileRoute } from '@tanstack/react-router'
import { prisma } from '@/lib/prisma'

export const Route = createFileRoute('/api/projects/$projectId')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { projectId } = params

        const project = await prisma.project.findUnique({
          where: {
            id: projectId,
          },
        })

        return new Response(JSON.stringify(project), {
          headers: {
            'Content-Type': 'application/json',
          },
        })
      },
      DELETE: async ({ params }) => {
        const { projectId } = params

        const project = await prisma.project.delete({
          where: {
            id: projectId,
          },
        })

        return new Response(JSON.stringify(project), {
          headers: {
            'Content-Type': 'application/json',
          },
        })
      },
      PUT: async ({ request, params }) => {
        const { projectId } = params
        const body = await request.json()

        const project = await prisma.project.update({
          where: {
            id: projectId,
          },
          data: body,
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
