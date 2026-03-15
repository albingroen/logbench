import { RiBracesFill, RiJavascriptFill } from '@remixicon/react'
import { Card, CardContent } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { CurlExample } from './curl-example'
import { TypeScriptSDKExample } from './typescript-sdk-example'
import { PythonSDKExample } from './python-sdk-example'
import { GoSDKExample } from './go-sdk-example'
import { GoIcon, PythonIcon } from './icons'
import type { Project } from 'generated/prisma/browser'

type CodeExamplesProps = {
  projectId: Project['id']
}

export function CodeExamples({ projectId }: CodeExamplesProps) {
  return (
    <div className="p-6 flex-1 flex justify-center items-center w-full flex-col gap-4">
      <div className="flex flex-col gap-6 w-full max-w-200">
        <div className="flex flex-col gap-1.5">
          <p className="text-lg font-medium">Let's send your first log</p>
          <p className="text-sm text-muted-foreground">
            To start ingesting logs, you can start by using the cURL command
            below.
          </p>
        </div>
        <Card className="py-2 w-full">
          <CardContent className="px-2">
            <Tabs defaultValue="curl" className="gap-2.5">
              <TabsList>
                <TabsTrigger value="curl">
                  <RiBracesFill />
                  cURL
                </TabsTrigger>
                <TabsTrigger value="typescript">
                  <RiJavascriptFill className="text-yellow-400" />
                  JavaScript SDK
                </TabsTrigger>
                <TabsTrigger value="python">
                  <PythonIcon />
                  Python SDK
                </TabsTrigger>
                <TabsTrigger value="go">
                  <GoIcon />
                  Go SDK
                </TabsTrigger>
              </TabsList>
              <TabsContent value="curl">
                <CurlExample projectId={projectId} />
              </TabsContent>
              <TabsContent
                value="typescript"
                className="p-2 flex flex-col gap-4"
              >
                <TypeScriptSDKExample projectId={projectId} />
              </TabsContent>
              <TabsContent value="python" className="p-2 flex flex-col gap-4">
                <PythonSDKExample projectId={projectId} />
              </TabsContent>
              <TabsContent value="go" className="p-2 flex flex-col gap-4">
                <GoSDKExample projectId={projectId} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
