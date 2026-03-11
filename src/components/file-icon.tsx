import { RiFile2Fill, RiJavascriptFill, RiReactjsLine } from '@remixicon/react'
import { TypescriptIcon } from './icons'
import type { ComponentType } from 'react'
import { cn } from '@/lib/utils'

const EXTENSION_CONFIG: Record<
  string,
  { icon: ComponentType<{ className?: string }>; color: string }
> = {
  js: { icon: RiJavascriptFill, color: 'text-yellow-400' },
  jsx: { icon: RiReactjsLine, color: 'text-yellow-400' },
  ts: { icon: TypescriptIcon, color: 'text-blue-500' },
  tsx: { icon: RiReactjsLine, color: 'text-blue-400' },
}

type FileIconProps = {
  extension?: string
  className?: string
}

export function FileIcon({ extension, className }: FileIconProps) {
  const config = extension && EXTENSION_CONFIG[extension.toLowerCase()]
  const Icon = config ? config.icon : RiFile2Fill
  return <Icon className={config ? cn(className, config.color) : className} />
}
