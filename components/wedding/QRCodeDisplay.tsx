'use client'

import { useState } from 'react'
import { QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Props {
  url: string
}

export default function QRCodeDisplay({ url }: Props) {
  const [open, setOpen] = useState(false)
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(url)}`

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="border-[var(--border)]"
      >
        <QrCode className="w-3.5 h-3.5 mr-1" /> QR code
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xs text-center">
          <DialogHeader>
            <DialogTitle>Scan to join</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[var(--muted-foreground)] -mt-2">
            Share this code at the wedding or send it to guests
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt="Invite QR Code"
            width={240}
            height={240}
            className="rounded-xl mx-auto border border-[var(--border)]"
          />
          <a
            href={src}
            download="wedify-invite-qr.png"
            className="text-xs text-[var(--primary)] hover:underline"
          >
            Download QR code
          </a>
        </DialogContent>
      </Dialog>
    </>
  )
}
