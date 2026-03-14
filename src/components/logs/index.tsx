import { columns } from './columns'
import { DataTable } from './data-table'
import type { Log } from 'generated/prisma/browser'

/** Optional: when logs are loaded via API/React Query, pass data here and trigger refetch on SSE log.created in the route. */
export interface LogsProps {
  data: Array<Log>
  search?: string
}

export function Logs({ data, search }: LogsProps) {
  return <DataTable columns={columns} data={data} search={search} />
}
