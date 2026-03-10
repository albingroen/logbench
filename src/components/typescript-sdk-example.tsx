import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { RiExternalLinkLine } from '@remixicon/react'
import type { Project } from 'generated/prisma/browser'
import { highlightCode } from '@/lib/shiki'

type TypeScriptSDKExampleProps = {
  projectId: Project['id']
}

const BUN_INSTALL_COMMAND = 'bun add -D logbench-js'

export function TypeScriptSDKExample({ projectId }: TypeScriptSDKExampleProps) {
  // Helpers
  const typeScriptSnippet = useMemo(
    () =>
      `import { Logbench } from "logbench-js";

const logger = new Logbench({
  projectId: import.meta.env.VITE_LOGBENCH_PROJECT_ID // → "${projectId}"
});

logger.info("Server started on port 3000");
logger.warn("Disk usage above 80%");
logger.err("Failed to connect to database");`,
    [projectId],
  )

  const { data: typeScriptInstallSnippet } = useQuery({
    queryKey: ['projects', projectId, 'examples', 'typeScript', 'install'],
    queryFn: async () => {
      const html = await highlightCode(BUN_INSTALL_COMMAND, 'typescript')

      return html
    },
  })

  const { data: typeScriptExample } = useQuery({
    queryKey: [
      'projects',
      projectId,
      'examples',
      'typeScript',
      typeScriptSnippet,
    ],
    queryFn: async () => {
      if (!typeScriptSnippet) {
        return
      }

      const html = await highlightCode(typeScriptSnippet, 'typescript')

      return html
    },
    enabled: !!typeScriptSnippet,
  })

  if (!typeScriptSnippet || !typeScriptExample || !typeScriptInstallSnippet) {
    return null
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.75">
        <h3 className="text-base font-mediumn">Javascript/TypeScript SDK</h3>

        <p className="text-muted-foreground text-xs/relaxed text-balance">
          The SDK for JavaScript and TypeScript is a small wrapper around fetch
          that helps with serialization of non-json objects. If you prefer to
          implement this yourself, you can check out the code on{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/albingroen/logbench-js/blob/main/index.ts"
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
          dangerouslySetInnerHTML={{ __html: typeScriptInstallSnippet }}
        />
      </div>

      <div className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-2">
          <p className="text-sm">2. Send your first log</p>
          <div
            className="code-example"
            dangerouslySetInnerHTML={{ __html: typeScriptExample }}
          />
        </div>

        <p className="text-muted-foreground text-xs">
          Want to learn more about the JavaScript SDK? Head to the{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/albingroen/logbench-js"
            className="underline underline-offset-4 inline-flex items-center gap-0.75 decoration-muted-foreground/50 hover:decoration-foreground hover:text-foreground"
          >
            <span>docs</span> <RiExternalLinkLine className="size-3.5" />
          </a>
        </p>
      </div>
    </div>
  )
}
