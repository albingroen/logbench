import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['api'],
    queryFn: () => axios.get('/api').then((res) => res.data),
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return data ? <p>{data}</p> : <div>No data</div>
}
