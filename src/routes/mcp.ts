import { createFileRoute } from '@tanstack/react-router'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

function isLocalhost(request: Request): boolean {
  const host = new URL(request.url).hostname
  return host === 'localhost' || host === '127.0.0.1' || host === '[::1]'
}

function createMcpServer() {
  const server = new McpServer({
    name: 'logbench',
    version: '0.1.0',
  })

  server.tool(
    'get_projects',
    'List all projects with log counts',
    {},
    async () => {
      const projects = await prisma.project.findMany({
        include: { _count: { select: { logs: true } } },
        orderBy: { createdAt: 'desc' },
      })
      return { content: [{ type: 'text', text: JSON.stringify(projects) }] }
    },
  )

  // @ts-expect-error zod version mismatch
  server.tool(
    'get_project',
    'Get a single project by ID',
    { projectId: z.string() },
    async ({ projectId }) => {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { _count: { select: { logs: true } } },
      })
      if (!project) {
        return {
          content: [{ type: 'text', text: 'Project not found' }],
          isError: true,
        }
      }
      return { content: [{ type: 'text', text: JSON.stringify(project) }] }
    },
  )

  // @ts-expect-error zod version mismatch
  server.tool(
    'get_logs',
    'List logs for a project',
    { projectId: z.string() },
    async ({ projectId }) => {
      const logs = await prisma.log.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
        take: 100,
      })
      return { content: [{ type: 'text', text: JSON.stringify(logs) }] }
    },
  )

  // @ts-expect-error zod version mismatch
  server.tool(
    'get_log',
    'Get a single log by ID',
    { logId: z.string() },
    async ({ logId }) => {
      const log = await prisma.log.findUnique({ where: { id: logId } })
      if (!log) {
        return {
          content: [{ type: 'text', text: 'Log not found' }],
          isError: true,
        }
      }
      return { content: [{ type: 'text', text: JSON.stringify(log) }] }
    },
  )

  return server
}

async function handleMcpRequest(request: Request): Promise<Response> {
  if (!isLocalhost(request)) {
    return new Response('Forbidden', { status: 403 })
  }

  const transport = new WebStandardStreamableHTTPServerTransport({
    enableJsonResponse: true,
  })

  const server = createMcpServer()
  await server.connect(transport)

  const response = await transport.handleRequest(request)

  await server.close()

  return response
}

export const Route = createFileRoute('/mcp')({
  server: {
    handlers: {
      POST: ({ request }) => handleMcpRequest(request),
    },
  },
})
