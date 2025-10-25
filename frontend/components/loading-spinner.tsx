import { Spinner } from "@/components/ui/spinner"

interface LoadingSpinnerProps {
  message?: string
}

export function LoadingSpinner({ message = "Loading..." }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <Spinner className="size-8" />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  )
}
