'use client'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <p className="text-sm text-destructive">{error.message}</p>
      <button onClick={reset} className="mt-4 text-sm underline">
        Try again
      </button>
    </div>
  )
}
