import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const bodySchema = z.object({
  content: z.any(),
})

export const Route = createFileRoute('/$projectId/logs')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown
        try {
          body = await request.json()
        } catch {
          return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
            status: 400,
          })
        }

        const parsed = bodySchema.safeParse(body)

        if (!parsed.success) {
          return new Response(JSON.stringify({ error: parsed.error.message }), {
            status: 400,
          })
        }

        return new Response(JSON.stringify({ received: parsed.data }), {
          status: 200,
        })
      },
    },
  },
})
