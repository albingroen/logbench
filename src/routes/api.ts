import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return new Response('Hello, World')
      },
    },
  },
})
