import { Link } from '@tanstack/react-router'

export function Logo() {
  return (
    <Link to="/" className="lowercase text-base font-semibold">
      Logbench
    </Link>
  )
}
