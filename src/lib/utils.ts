import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ClassValue } from 'clsx'

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

export function isObject(value: unknown) {
  return typeof value === 'object' && value !== null
}

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

export function formatDateTime(date: Date | string) {
  return dateTimeFormatter.format(new Date(date))
}

const relativeFormatter = new Intl.RelativeTimeFormat(undefined, {
  numeric: 'always',
  style: 'long',
})

const RELATIVE_UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 365 * 24 * 60 * 60 * 1000],
  ['month', 30 * 24 * 60 * 60 * 1000],
  ['day', 24 * 60 * 60 * 1000],
  ['hour', 60 * 60 * 1000],
  ['minute', 60 * 1000],
  ['second', 1000],
]

export function formatRelativeTime(date: Date | string) {
  const diff = new Date(date).getTime() - Date.now()
  for (const [unit, ms] of RELATIVE_UNITS) {
    if (Math.abs(diff) >= ms || unit === 'second') {
      return relativeFormatter.format(Math.round(diff / ms), unit)
    }
  }
  return relativeFormatter.format(0, 'second')
}
