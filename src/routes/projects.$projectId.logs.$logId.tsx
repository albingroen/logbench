import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { format, formatDistanceToNowStrict } from 'date-fns'
import { toast } from 'sonner'
import { RiBookmarkFill } from '@remixicon/react'
import type { Log } from 'generated/prisma/browser'
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
    queryFn: () =>
      axios
        .get<Log>(`/api/projects/${projectId}/logs/${logId}`)
        .then((res) => res.data),
  })

  const { mutate: deleteLog } = useMutation({
    mutationFn: () =>
      axios
        .delete<Log>(`/api/projects/${projectId}/logs/${logId}`)
        .then((res) => res.data),
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
      <SheetContent>
        {log ? (
          <>
            <SheetHeader>
              <SheetTitle>
                {format(log.createdAt, 'yyyy-MM-dd HH:mm:ss')}
              </SheetTitle>
              <div className="flex items-center gap-1.5 mt-1.5">
                {log.isBookmarked && (
                  <Badge variant="warning">
                    <RiBookmarkFill />
                    Bookmarkd
                  </Badge>
                )}
                <LogLevelBadge level={log.level} />
                <Badge variant="outline">
                  {formatDistanceToNowStrict(log.createdAt, {
                    addSuffix: true,
                  })}
                </Badge>
                <Badge variant="outline">ID: {log.id}</Badge>
              </div>
            </SheetHeader>

            <Tabs defaultValue="content" className="h-[calc(100%-112px-96px)]">
              <TabsList variant="line" className="px-3">
                <TabsTrigger value="content">Content</TabsTrigger>
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
            <SheetTitle>Loading...</SheetTitle>
            <SheetDescription>Loading...</SheetDescription>
          </SheetHeader>
        )}
      </SheetContent>
    </Sheet>
  )
}
