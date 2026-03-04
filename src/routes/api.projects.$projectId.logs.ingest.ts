import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const bodySchema = z.object({
  content: z.any(),
  level: z.enum(['INFO', 'WARNING', 'ERROR']).optional(),
})

type Client = ReadableStreamDefaultController<Uint8Array>
const subscribersByProject = new Map<string, Set<Client>>()
const encoder = new TextEncoder()

function publish(projectId: string, event: unknown) {
  const clients = subscribersByProject.get(projectId)
  if (!clients) return
  const payload = encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
  for (const client of clients) {
    try {
      client.enqueue(payload)
    } catch {
      // connection closed, will be cleaned on next write or cancel
    }
  }
}

export const Route = createFileRoute('/api/projects/$projectId/logs/ingest')({
  server: {
    handlers: {
      GET: ({ request, params }) => {
        const url = new URL(request.url)
        if (url.searchParams.get('stream') !== '1') {
          return new Response('Not found', { status: 404 })
        }

        const { projectId } = params
        const stream = new ReadableStream<Uint8Array>({
          start(controller) {
            let clients = subscribersByProject.get(projectId)
            if (!clients) {
              clients = new Set()
              subscribersByProject.set(projectId, clients)
            }
            clients.add(controller)
            controller.enqueue(encoder.encode(': connected\n\n'))
          },
          cancel() {
            const clients = subscribersByProject.get(projectId)
            if (!clients) return
            // controller reference is lost; we prune dead clients on next publish
          },
        })

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            Connection: 'keep-alive',
          },
        })
      },
      POST: async ({ request, params }) => {
        let body: unknown
        try {
          body = await request.json()
        } catch {
          return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          })
        }

        const parsed = bodySchema.safeParse(body)

        if (!parsed.success) {
          return new Response(JSON.stringify({ error: parsed.error.message }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          })
        }

        const log = await prisma.log.create({
          data: {
            content: {
              value: parsed.data.content,
            },
            level: parsed.data.level,
            project: {
              connect: {
                id: params.projectId,
              },
            },
          },
        })

        publish(params.projectId, { type: 'log.created', log })

        return new Response(JSON.stringify(log), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
          },
        })
      },
      OPTIONS: () => {
        return new Response(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
          },
        })
      },
    },
  },
})
