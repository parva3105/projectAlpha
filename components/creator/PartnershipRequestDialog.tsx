'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface PartnershipRequestDialogProps {
  creatorName: string
}

export function PartnershipRequestDialog({ creatorName }: PartnershipRequestDialogProps) {
  const [message, setMessage] = useState('')
  const [open, setOpen] = useState(false)

  function handleSubmit() {
    toast.success(`Partnership request sent to ${creatorName}!`)
    setOpen(false)
    setMessage('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>Send Partnership Request</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Partnership Request</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <Textarea
            placeholder="Optional message..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={4}
          />
          <Button onClick={handleSubmit} className="w-full">
            Send Request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
