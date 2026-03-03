import { format } from 'date-fns'
import { LogContentInline } from '../log-content'
import type { ColumnDef } from '@tanstack/react-table'
import type { Log } from 'generated/prisma/browser'

export const columns: Array<ColumnDef<Log>> = [
  {
    accessorKey: 'createdAt',
    header: 'Time',
    cell: ({ row }) => {
      const createdAt = row.getValue<Date>('createdAt')
      const formatted = format(createdAt, 'yyyy-MM-dd HH:mm:ss')

      return formatted
    },
  },
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    header: 'Type',
    accessorKey: 'level',
    cell: ({ row }) => {
      return (
        <span className="text-muted-foreground uppercase">
          {row.getValue('level')}
        </span>
      )
    },
  },
  {
    accessorKey: 'content',
    header: 'Value',
    cell: ({ row }) => {
      return <LogContentInline content={row.getValue('content')} />
    },
  },
]
