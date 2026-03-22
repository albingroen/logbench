import { RiSearchLine } from '@remixicon/react'

import { Label } from '@/components/ui/label'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarInput,
} from '@/components/ui/sidebar'

type ProjectSearchProps = {
  onChange: (value: string) => void
  value: string
}

export function ProjectSearch({ value, onChange }: ProjectSearchProps) {
  return (
    <SidebarGroup className="py-0">
      <SidebarGroupContent className="relative">
        <Label htmlFor="search" className="sr-only">
          Search
        </Label>
        <SidebarInput
          id="search"
          placeholder="Find a project..."
          className="pl-8"
          type="search"
          value={value}
          onChange={(e) => {
            onChange(e.currentTarget.value)
          }}
        />
        <RiSearchLine className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
