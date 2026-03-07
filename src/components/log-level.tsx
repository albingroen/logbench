import { LogLevel } from 'generated/prisma/enums'
import {
  RiAlertFill,
  RiErrorWarningFill,
  RiInformationFill,
} from '@remixicon/react'
import { Badge } from './ui/badge'
import type { badgeVariants } from './ui/badge'
import type { RemixiconComponentType } from '@remixicon/react'
import type { VariantProps } from 'class-variance-authority'

type LogLevelBadgeProps = {
  level: LogLevel
}

export const LogLevelMetadata: Record<
  LogLevel,
  {
    variant: VariantProps<typeof badgeVariants>['variant']
    icon: RemixiconComponentType
    label: string
  }
> = {
  [LogLevel.ERROR]: {
    icon: RiErrorWarningFill,
    variant: 'destructive',
    label: 'ERROR',
  },
  [LogLevel.INFO]: {
    icon: RiInformationFill,
    variant: 'outline',
    label: 'INFO',
  },
  [LogLevel.WARNING]: {
    icon: RiAlertFill,
    variant: 'warning',
    label: 'WARN',
  },
}

export function LogLevelBadge({ level }: LogLevelBadgeProps) {
  const { icon: Icon, variant, label } = LogLevelMetadata[level]

  return (
    <Badge variant={variant}>
      <Icon />
      <span>{label}</span>
    </Badge>
  )
}
