import { LogContentInline } from '../log-content'
import { LogLevelBadge } from '../log-level'
import type { ColumnDef } from '@tanstack/react-table'
import type { Log } from 'generated/prisma/browser'
import { formatDateTime } from '@/lib/utils'

export const columns: Array<ColumnDef<Log>> = [
  {
    accessorKey: 'createdAt',
    header: 'Time',
    cell: ({ row }) => {
      const createdAt = row.getValue<Date>('createdAt')

      return <span className="tabular-nums">{formatDateTime(createdAt)}</span>
    },
  },
  {
    header: 'Type',
    accessorKey: 'level',
    cell: ({ row }) => {
      return <LogLevelBadge level={row.getValue('level')} />
    },
  },
  {
    accessorKey: 'content',
    header: 'Value',
    cell: ({ row }) => {
      return (
        <LogContentInline
          level={row.original.level}
          content={row.original.content}
        />
      )
    },
  },
]
