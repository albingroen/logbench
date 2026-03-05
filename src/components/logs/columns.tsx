import { format } from 'date-fns'
import { LogContentInline } from '../log-content'
import { LogLevelBadge } from '../log-level'
import type { ColumnDef } from '@tanstack/react-table'
import type { Log } from 'generated/prisma/browser'

export const columns: Array<ColumnDef<Log>> = [
  {
    accessorKey: 'createdAt',
    header: 'Time',
    cell: ({ row }) => {
      const createdAt = row.getValue<Date>('createdAt')
      const formatted = format(createdAt, 'yyyy-MM-dd HH:mm:ss')

      return <span>{formatted}</span>
    },
  },
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => {
      return <span>{row.getValue('id')}</span>
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
          level={row.getValue('level')}
          content={row.getValue('content')}
        />
      )
    },
  },
]
