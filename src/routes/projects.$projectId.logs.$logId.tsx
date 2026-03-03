import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { format, formatDistanceToNow } from 'date-fns'
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
  const { data: log } = useQuery({
    queryKey: ['projects', projectId, 'logs', logId],
    queryFn: () =>
      axios
        .get<Log>(`/api/projects/${projectId}/logs/${logId}`)
        .then((res) => res.data),
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
    }, 300)
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
                <Badge variant="outline">
                  {formatDistanceToNow(log.createdAt, { addSuffix: true })}
                </Badge>
                <Badge variant="outline">ID: {log.id}</Badge>
              </div>
            </SheetHeader>

            <div className="px-6 pb-2">
              <p className="text-muted-foreground">Value</p>
            </div>

            <LogContentBlock content={log.content} />

            <SheetFooter className="sticky bottom-0 bg-linear-to-b from-transparent via-sidebar pt-14! to-sidebar z-20">
              <Button className="backdrop-blur-2xl!" variant="destructive">
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
