import { format } from 'date-fns'
import type { ColumnDef } from '@tanstack/react-table'

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Log = {
  id: string
  value: unknown
  createdAt: Date
}

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
    cell: () => {
      return <span className="text-blue-400 uppercase">Info</span>
    },
  },
  {
    accessorKey: 'value',
    header: 'Value',
  },
]
