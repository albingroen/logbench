import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { RiBookmarkFill } from '@remixicon/react'
import { formatDateTime, formatRelativeTime } from '@/lib/utils'
import { deleteLog as deleteLogFn, getLog as getLogFn } from '@/lib/server/logs'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { LogContentBlock } from '@/components/log-content'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LogLevelBadge } from '@/components/log-level'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AnnotateForm } from '@/components/annotate-form'
import { LogSource } from '@/components/log-source'

export const Route = createFileRoute('/projects/$projectId/logs/$logId')({
  component: RouteComponent,
})

function RouteComponent() {
  // Router state
  const { projectId, logId } = Route.useParams()
  const navigate = useNavigate()

  // Local state
  const [isOpen, setIsOpen] = useState<boolean>(true)

  // Server state
  const queryClient = useQueryClient()

  const { data: log } = useQuery({
    queryKey: ['projects', projectId, 'logs', logId],
    queryFn: () => getLogFn({ data: { logId } }),
  })

  const { mutate: deleteLog } = useMutation({
    mutationFn: () => deleteLogFn({ data: { logId } }),
    onSuccess: () => {
      toast.success('Log deleted')
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'logs'],
      })
      handleClose()
    },
    onError: () => {
      toast.error('Failed to delete log')
    },
  })

  // Handlers
  function handleClose() {
    setIsOpen(false)

    setTimeout(() => {
      navigate({
        to: '/projects/$projectId',
        params: {
          projectId,
        },
        resetScroll: false,
      })
    }, 200)
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="focus:outline-none">
        {log ? (
          <>
            <SheetHeader>
              <SheetTitle>{formatDateTime(log.createdAt)}</SheetTitle>
              <div className="flex items-center gap-1.5 mt-1.5">
                {log.isBookmarked && (
                  <Badge variant="warning">
                    <RiBookmarkFill />
                    Bookmarked
                  </Badge>
                )}
                <LogLevelBadge level={log.level} />
                <Badge variant="outline">
                  {formatRelativeTime(log.createdAt)}
                </Badge>
                <Badge variant="outline">ID: {log.id}</Badge>
              </div>

              {log.source && <LogSource source={log.source} />}
            </SheetHeader>

            <Tabs defaultValue="content" className="h-[calc(100%-112px-96px)]">
              <TabsList variant="line" className="px-3">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="annotate">
                  Annotate
                  {log.annotation && <Badge className="size-1.25 ml-px p-0" />}
                </TabsTrigger>
                <TabsTrigger disabled value="metadata">
                  Metadata
                </TabsTrigger>
              </TabsList>
              <TabsContent value="content" className="flex-1 min-h-0">
                <LogContentBlock
                  logId={log.id}
                  level={log.level}
                  content={log.content}
                />
              </TabsContent>

              <TabsContent value="annotate" className="p-4">
                <AnnotateForm annotation={log.annotation} logId={logId} />
              </TabsContent>
            </Tabs>

            <SheetFooter>
              <Button
                type="button"
                className="backdrop-blur-2xl!"
                variant="destructive"
                onClick={() => deleteLog()}
              >
                Delete
              </Button>

              <SheetClose asChild>
                <Button className="backdrop-blur-2xl" variant="ghost">
                  Close
                </Button>
              </SheetClose>
            </SheetFooter>
          </>
        ) : (
          <SheetHeader>
            <SheetTitle>Loading…</SheetTitle>
            <SheetDescription>Loading…</SheetDescription>
          </SheetHeader>
        )}
      </SheetContent>
    </Sheet>
  )
}
