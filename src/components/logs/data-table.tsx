import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { RiBookmarkFill, RiBookmarkLine } from '@remixicon/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '../ui/context-menu'
import type { ColumnDef } from '@tanstack/react-table'

import type { Log } from 'generated/prisma/browser'
import { updateLog as updateLogFn } from '@/lib/server/logs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface DataTableProps<TData, TValue> {
  columns: Array<ColumnDef<TData, TValue>>
  data: Array<TData>
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData & Log, TValue>) {
  // Router state
  const navigate = useNavigate()
  const location = useLocation()

  // Local state
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  // Helpers
  function openLog(row: { original: TData & Log }) {
    if (!row.original.projectId) return
    navigate({
      to: '/projects/$projectId/logs/$logId',
      params: {
        projectId: row.original.projectId,
        logId: row.original.id,
      },
      resetScroll: false,
    })
  }

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

  return (
    <Table className="table-fixed">
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header, i) => {
              return (
                <TableHead
                  key={header.id}
                  className={cn(
                    ['w-52 text-muted-foreground', 'w-20', 'w-auto'][i],
                  )}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              )
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody className="logs">
        {table.getRowModel().rows.map((row) => (
          <ContextMenu key={row.id}>
            <ContextMenuTrigger asChild>
              <TableRow
                role="button"
                data-state={
                  row.getIsSelected()
                    ? 'selected'
                    : row.original.isBookmarked
                      ? 'bookmarked'
                      : undefined
                }
                data-active={location.pathname.includes(row.original.id)}
                onClick={() => openLog(row)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    openLog(row)
                  }
                }}
              >
                {row.getVisibleCells().map((cell, i) => (
                  <TableCell
                    key={cell.id}
                    className={
                      ['w-52 text-muted-foreground', 'w-20', 'w-auto'][i]
                    }
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            </ContextMenuTrigger>
            <ContextMenuContent>
              {row.original.isBookmarked ? (
                <ContextMenuItem
                  onSelect={() => {
                    if (!row.original.projectId) {
                      return
                    }

                    updateLog({
                      logId: row.original.id,
                      body: {
                        isBookmarked: false,
                      },
                    })
                  }}
                >
                  <RiBookmarkFill className="text-warning" />
                  Unmark
                </ContextMenuItem>
              ) : (
                <ContextMenuItem
                  onSelect={() => {
                    if (!row.original.projectId) {
                      return
                    }

                    updateLog({
                      logId: row.original.id,
                      body: {
                        isBookmarked: true,
                      },
                    })
                  }}
                >
                  <RiBookmarkLine />
                  Bookmark
                </ContextMenuItem>
              )}
            </ContextMenuContent>
          </ContextMenu>
        ))}
      </TableBody>
    </Table>
  )
}
