"use client"

import type { ReactNode } from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ComingSoonDialogProps {
  label: string
  children: ReactNode
}

export function ComingSoonDialog({ label, children }: ComingSoonDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#B22222]">Coming Soon</DialogTitle>
          <DialogDescription>
            {label} isn&apos;t available yet. It will be posted here soon.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
