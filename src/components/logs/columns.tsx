import { format } from 'date-fns'
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
        <span className="text-blue-400 uppercase">{row.getValue('level')}</span>
      )
    },
  },
  {
    accessorKey: 'content',
    header: 'Value',
    cell: ({ row }) => {
      return JSON.stringify(row.getValue('content'))
    },
  },
]
