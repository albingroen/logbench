import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/projects/$projectId/logs/$logId')({
  component: RouteComponent,
})

function RouteComponent() {
  // Local state
  const [isOpen, setIsOpen] = useState<boolean>(true)

  // Router state
  const { projectId } = Route.useParams()
  const navigate = useNavigate()

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
        <SheetHeader>
          <SheetTitle>Log</SheetTitle>
          <SheetDescription>Log desc</SheetDescription>
        </SheetHeader>
        <div className="px-6 pb-6">
          <SheetClose asChild>
            <Button>Close</Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}
