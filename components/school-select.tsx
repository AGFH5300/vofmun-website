"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface SchoolSelectProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
  error?: boolean
}

export function SchoolSelect({
  value,
  onValueChange,
  placeholder = "Enter your school/institution name...",
  className,
  error,
}: SchoolSelectProps) {
  return (
    <Input
      value={value || ""}
      onChange={(e) => onValueChange(e.target.value)}
      placeholder={placeholder}
      className={cn("w-full", error ? "border-red-500" : "", className)}
      data-testid="input-school"
    />
  )
}