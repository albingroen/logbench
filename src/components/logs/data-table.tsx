import { memo, useCallback, useEffect, useRef } from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { RiBookmarkFill, RiBookmarkLine } from '@remixicon/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import Mark from 'mark.js'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '../ui/context-menu'
import type { ColumnDef, Row } from '@tanstack/react-table'

import type { Log } from 'generated/prisma/browser'
import { updateLog as updateLogFn } from '@/lib/server/logs'
import { cn } from '@/lib/utils'

interface DataTableProps<TData, TValue> {
  columns: Array<ColumnDef<TData, TValue>>
  data: Array<TData>
  search?: string
}

const ROW_CLASS = cn(
  'grid grid-cols-[13rem_5rem_1fr] border-b absolute left-0 w-full',
  'hover:bg-muted/30 data-[state=selected]:bg-muted data-[state=bookmarked]:transition-colors data-[state=bookmarked]:bg-warning/10 data-[active=true]:bg-muted/30 cursor-pointer',
)

interface VirtualRowProps {
  row: Row<Log>
  start: number
  index: number
  isActive: boolean
  measureElement: (el: Element | null) => void
  onOpenLog: (row: Row<Log>) => void
  onToggleBookmark: (logId: string, isBookmarked: boolean) => void
}

const VirtualRow = memo(
  function VirtualRow({
    row,
    start,
    index,
    isActive,
    measureElement,
    onOpenLog,
    onToggleBookmark,
  }: VirtualRowProps) {
    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            ref={measureElement}
            data-index={index}
            className={ROW_CLASS}
            style={{
              transform: `translateY(${start}px)`,
            }}
            role="button"
            data-state={
              row.getIsSelected()
                ? 'selected'
                : row.original.isBookmarked
                  ? 'bookmarked'
                  : undefined
            }
            data-active={isActive}
            onClick={() => onOpenLog(row)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onOpenLog(row)
              }
            }}
          >
            {row.getVisibleCells().map((cell) => (
              <div
                key={cell.id}
                className="px-4.5 py-2 align-top font-mono leading-relaxed text-balance break-all"
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            ))}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {row.original.isBookmarked ? (
            <ContextMenuItem
              onSelect={() => onToggleBookmark(row.original.id, false)}
            >
              <RiBookmarkFill className="text-warning" />
              Unmark
            </ContextMenuItem>
          ) : (
            <ContextMenuItem
              onSelect={() => onToggleBookmark(row.original.id, true)}
            >
              <RiBookmarkLine />
              Bookmark
            </ContextMenuItem>
          )}
        </ContextMenuContent>
      </ContextMenu>
    )
  },
  (prev, next) =>
    prev.row.original === next.row.original &&
    prev.start === next.start &&
    prev.index === next.index &&
    prev.isActive === next.isActive &&
    prev.onOpenLog === next.onOpenLog &&
    prev.onToggleBookmark === next.onToggleBookmark &&
    prev.measureElement === next.measureElement,
)

export function DataTable<TData, TValue>({
  columns,
  data,
  search,
}: DataTableProps<TData & Log, TValue>) {
  // Router state
  const navigate = useNavigate()
  const location = useLocation()
  const activeLogId = location.pathname.split('/logs/')[1] ?? ''

  // Refs
  const scrollRef = useRef<HTMLDivElement>(null)
  const markRef = useRef<Mark | null>(null)

  // Local state
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const rows = table.getRowModel().rows

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 48,
    overscan: 10,
    measureElement: (el) => el.getBoundingClientRect().height,
  })

  // Mark.js integration — use a ref for search so the MutationObserver
  // callback always sees the latest value without re-subscribing.
  const searchRef = useRef(search)
  searchRef.current = search

  const logsRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<MutationObserver | null>(null)

  const runMark = useCallback(() => {
    // Disconnect observer before mutating DOM to avoid infinite loop
    observerRef.current?.disconnect()

    if (!markRef.current) markRef.current = new Mark('.logs')
    markRef.current.unmark()
    if (searchRef.current) {
      markRef.current.mark(searchRef.current, { acrossElements: true })
    }

    // Reconnect observer after marking is done
    const el = logsRef.current
    if (el && observerRef.current) {
      observerRef.current.observe(el, { childList: true, subtree: true })
    }
  }, [])

  // Re-run mark on scroll range changes and search changes
  const virtualItems = virtualizer.getVirtualItems()
  const rangeStart = virtualItems[0]?.index
  const rangeEnd = virtualItems[virtualItems.length - 1]?.index

  useEffect(() => {
    runMark()
  }, [runMark, search, rangeStart, rangeEnd])

  // Observe DOM content changes (e.g. Shiki highlighting resolves)
  useEffect(() => {
    const el = logsRef.current
    if (!el) return
    const observer = new MutationObserver(runMark)
    observerRef.current = observer
    observer.observe(el, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
      observerRef.current = null
    }
  }, [runMark])

  // Stable callbacks
  const openLog = useCallback(
    (row: Row<Log>) => {
      if (!row.original.projectId) return
      navigate({
        to: '/projects/$projectId/logs/$logId',
        params: {
          projectId: row.original.projectId,
          logId: row.original.id,
        },
        resetScroll: false,
      })
    },
    [navigate],
  )

  // Server state
  const queryClient = useQueryClient()

  const { mutate: updateLog } = useMutation({
    mutationFn: ({
      logId,
      body,
    }: {
      logId: Log['id']
      body: { annotation?: string | null; isBookmarked?: boolean }
    }) => updateLogFn({ data: { logId, data: body } }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({
        queryKey: ['projects', res.projectId, 'logs'],
      })
    },
    onError: () => {
      toast.error('Failed to update log')
    },
  })

  // Stable ref so toggleBookmark doesn't break VirtualRow memo
  const updateLogRef = useRef(updateLog)
  updateLogRef.current = updateLog

  const toggleBookmark = useCallback((logId: string, isBookmarked: boolean) => {
    updateLogRef.current({ logId, body: { isBookmarked } })
  }, [])

  const headerGroups = table.getHeaderGroups()

  return (
    <div className="relative w-full overflow-x-auto text-xs">
      {/* Header */}
      <div className="grid grid-cols-[13rem_5rem_1fr] border-b">
        {headerGroups.map((headerGroup) =>
          headerGroup.headers.map((header, i) => (
            <div
              key={header.id}
              className={cn(
                'text-muted-foreground h-10 px-4.5 flex items-center text-left font-medium whitespace-nowrap',
                i === 0 && 'text-muted-foreground',
              )}
            >
              {header.isPlaceholder
                ? null
                : flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
            </div>
          )),
        )}
      </div>

      {/* Scroll container */}
      <div ref={scrollRef} className="overflow-y-auto h-[calc(100dvh-89px)]">
        {/* Inner container */}
        <div
          ref={logsRef}
          className="logs relative w-full"
          style={{ height: virtualizer.getTotalSize() }}
        >
          {virtualItems.map((virtualRow) => {
            const row = rows[virtualRow.index] as Row<Log>
            return (
              <VirtualRow
                key={row.id}
                row={row}
                start={virtualRow.start}
                index={virtualRow.index}
                isActive={row.original.id === activeLogId}
                measureElement={virtualizer.measureElement}
                onOpenLog={openLog}
                onToggleBookmark={toggleBookmark}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
