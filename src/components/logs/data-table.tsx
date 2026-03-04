import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useLocation, useNavigate } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'

import type { Log } from 'generated/prisma/browser'
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
                    ['w-44 text-muted-foreground', 'w-56', 'w-20', 'w-auto'][i],
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
          <TableRow
            key={row.id}
            data-state={row.getIsSelected() ? 'selected' : undefined}
            data-active={location.pathname.includes(row.original.id)}
            onClick={() => {
              if (!row.original.projectId) {
                return
              }

              navigate({
                to: '/projects/$projectId/logs/$logId',
                params: {
                  projectId: row.original.projectId,
                  logId: row.original.id,
                },
                resetScroll: false,
              })
            }}
          >
            {row.getVisibleCells().map((cell, i) => (
              <TableCell
                key={cell.id}
                className={
                  [
                    'w-44 text-muted-foreground',
                    'w-56 text-muted-foreground',
                    'w-20',
                    'w-auto',
                  ][i]
                }
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
