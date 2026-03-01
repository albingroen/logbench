import { columns } from './columns'
import { DataTable } from './data-table'

export function Logs() {
  return (
    <DataTable
      columns={columns}
      data={[
        {
          createdAt: new Date(),
          id: '1',
          value: 'testing log',
        },
        {
          createdAt: new Date(),
          id: '2',
          value:
            '[3e642a02-761d-4206-8690-5571fc09f83f, 3e642a02-761d-4206-8690-5571fc09f83f, 3e642a02-761d-4206-8690-5571fc09f83f, 3e642a02-761d-4206-8690-5571fc09f83f, 3e642a02-761d-4206-8690-5571fc09f83f, 3e642a02-761d-4206-8690-5571fc09f83f]',
        },
        {
          createdAt: new Date(),
          id: '3',
          value: JSON.stringify(USR),
        },
      ]}
    />
  )
}

const USR = {
  id: 1,
  name: 'Leanne Graham',
  username: 'Bret',
  email: 'Sincere@april.biz',
  address: {
    street: 'Kulas Light',
    suite: 'Apt. 556',
    city: 'Gwenborough',
    zipcode: '92998-3874',
    geo: {
      lat: '-37.3159',
      lng: '81.1496',
    },
  },
  phone: '1-770-736-8031 x56442',
  website: 'hildegard.org',
  company: {
    name: 'Romaguera-Crona',
    catchPhrase: 'Multi-layered client-server neural-net',
    bs: 'harness real-time e-markets',
  },
}
