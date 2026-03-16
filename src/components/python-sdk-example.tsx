import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { RiExternalLinkLine } from '@remixicon/react'
import { useTheme } from 'next-themes'
import type { Project } from 'generated/prisma/browser'
import { highlightCode } from '@/lib/shiki'

type PythonSDKExampleProps = {
  projectId: Project['id']
}

const UV_INSTALL_COMMAND = 'uv add logbench'

export function PythonSDKExample({ projectId }: PythonSDKExampleProps) {
  const { systemTheme } = useTheme()

  const pythonSnippet = useMemo(
    () =>
      `from logbench import Logbench

logger = Logbench(project_id="${projectId}")

logger.info("Server started on port 3000")
logger.warn("Disk usage above 80%")
logger.err("Failed to connect to database")`,
    [projectId],
  )

  const { data: pythonInstallSnippet } = useQuery({
    queryKey: [
      'projects',
      projectId,
      'examples',
      'python',
      'install',
      systemTheme,
    ],
    queryFn: async () => {
      const html = await highlightCode(UV_INSTALL_COMMAND, 'shell', systemTheme)

      return html
    },
  })

  const { data: pythonExample } = useQuery({
    queryKey: [
      'projects',
      projectId,
      'examples',
      'python',
      pythonSnippet,
      systemTheme,
    ],
    queryFn: async () => {
      if (!pythonSnippet) {
        return
      }

      const html = await highlightCode(pythonSnippet, 'python', systemTheme)

      return html
    },
    enabled: !!pythonSnippet,
  })

  if (!pythonSnippet || !pythonExample || !pythonInstallSnippet) {
    return null
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.75">
        <h3 className="text-base font-mediumn">Python SDK</h3>

        <p className="text-muted-foreground text-xs/relaxed text-balance">
          The SDK for Python is a small wrapper around requests that helps with
          serialization of non-json objects. If you prefer to implement this
          yourself, you can check out the code on{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/albingroen/logbench-python/blob/main/logbench/__init__.py"
            className="underline underline-offset-4 inline-flex items-center gap-0.75 decoration-muted-foreground/50 hover:decoration-foreground hover:text-foreground"
          >
            <span>GitHub</span> <RiExternalLinkLine className="size-3.5" />
          </a>
          .
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm">1. Install the SDK in your project</p>
        <div
          className="code-example"
          dangerouslySetInnerHTML={{ __html: pythonInstallSnippet }}
        />
      </div>

      <div className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-2">
          <p className="text-sm">2. Send your first log</p>
          <div
            className="code-example"
            dangerouslySetInnerHTML={{ __html: pythonExample }}
          />
        </div>

        <p className="text-muted-foreground text-xs">
          Want to learn more about the Python SDK? Head to the{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/albingroen/logbench-python"
            className="underline underline-offset-4 inline-flex items-center gap-0.75 decoration-muted-foreground/50 hover:decoration-foreground hover:text-foreground"
          >
            <span>docs</span> <RiExternalLinkLine className="size-3.5" />
          </a>
        </p>
      </div>
    </div>
  )
}
