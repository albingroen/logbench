import os from 'node:os'
import { createFileRoute } from '@tanstack/react-router'

function getLocalIPv4() {
  const interfaces = os.networkInterfaces()

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] ?? []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address
      }
    }
  }
  return '127.0.0.1' // fallback
}

export const Route = createFileRoute('/api/ip')({
  server: {
    handlers: {
      GET: ({ request }) => {
        const ip = getLocalIPv4()

        return new Response(ip)
      },
    },
  },
})
