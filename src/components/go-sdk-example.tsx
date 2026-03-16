import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { RiExternalLinkLine } from '@remixicon/react'
import { useTheme } from 'next-themes'
import type { Project } from 'generated/prisma/browser'
import { highlightCode } from '@/lib/shiki'

type GoSDKExampleProps = {
  projectId: Project['id']
}

const GO_INSTALL_COMMAND = 'go get github.com/albingroen/logbench-go'

export function GoSDKExample({ projectId }: GoSDKExampleProps) {
  const { systemTheme } = useTheme()

  const goSnippet = useMemo(
    () =>
      `package main

import "github.com/albingroen/logbench-go"

func main() {
    logger := logbench.New("${projectId}")
    defer logger.Close()

    logger.Info("Server started on port 3000")
    logger.Warn("Disk usage above 80%")
    logger.Err("Failed to connect to database")
}`,
    [projectId],
  )

  const { data: goInstallSnippet } = useQuery({
    queryKey: ['projects', projectId, 'examples', 'go', 'install', systemTheme],
    queryFn: async () => {
      const html = await highlightCode(GO_INSTALL_COMMAND, 'shell', systemTheme)

      return html
    },
  })

  const { data: goExample } = useQuery({
    queryKey: ['projects', projectId, 'examples', 'go', goSnippet, systemTheme],
    queryFn: async () => {
      if (!goSnippet) {
        return
      }

      const html = await highlightCode(goSnippet, 'go', systemTheme)

      return html
    },
    enabled: !!goSnippet,
  })

  if (!goSnippet || !goExample || !goInstallSnippet) {
    return null
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.75">
        <h3 className="text-base font-mediumn">Go SDK</h3>

        <p className="text-muted-foreground text-xs/relaxed text-balance">
          The SDK for Go sends logs in background goroutines for minimal
          performance impact. If you prefer to implement this yourself, you can
          check out the code on{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/albingroen/logbench-go"
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
          dangerouslySetInnerHTML={{ __html: goInstallSnippet }}
        />
      </div>

      <div className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-2">
          <p className="text-sm">2. Send your first log</p>
          <div
            className="code-example"
            dangerouslySetInnerHTML={{ __html: goExample }}
          />
        </div>

        <p className="text-muted-foreground text-xs">
          Want to learn more about the Go SDK? Head to the{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/albingroen/logbench-go"
            className="underline underline-offset-4 inline-flex items-center gap-0.75 decoration-muted-foreground/50 hover:decoration-foreground hover:text-foreground"
          >
            <span>docs</span> <RiExternalLinkLine className="size-3.5" />
          </a>
        </p>
      </div>
    </div>
  )
}
