import { columns } from './columns'
import { DataTable } from './data-table'
import type { Log } from 'generated/prisma/browser'

type LogsProps = {
  data: Array<Log>
}

export function Logs({ data }: LogsProps) {
  return <DataTable columns={columns} data={data} />
}
