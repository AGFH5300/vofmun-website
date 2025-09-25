
"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Sparkles, Info } from "lucide-react"
import { toast } from "sonner"

interface ExperienceItem {
  conference?: string
  position?: string
  year?: string
  description?: string
  role?: string
  organization?: string
}

interface AIExperienceModalProps {
  isOpen: boolean
  onClose: () => void
  roleType: "chair" | "admin"
  onExperiencesParsed: (experiences: ExperienceItem[]) => void
}

export function AIExperienceModal({ isOpen, onClose, roleType, onExperiencesParsed }: AIExperienceModalProps) {
  const [experienceText, setExperienceText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleAIParsing = async () => {
    if (!experienceText.trim()) {
      toast.error("Please enter your experience text first")
      return
    }

    setIsProcessing(true)

    try {
      const prompt = roleType === "chair" 
        ? `Parse the following text about MUN experience and extract structured data. Return a JSON array where each item has: conference (string), position (string), year (string), description (string, optional). Focus on Model UN conferences, debate competitions, and leadership roles. Here's the text: ${experienceText}`
        : `Parse the following text about relevant experience and extract structured data. Return a JSON array where each item has: role (string), organization (string), year (string), description (string, optional). Focus on leadership roles, organizational experience, event management, and administrative positions. Here's the text: ${experienceText}`

      const response = await fetch('/api/parse-experience', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: experienceText,
          roleType,
          prompt 
        }),
      })

      const result = await response.json()

      if (response.ok && result.experiences) {
        onExperiencesParsed(result.experiences)
        toast.success(`Successfully parsed ${result.experiences.length} experience entries!`)
        setExperienceText("")
        onClose()
      } else {
        throw new Error(result.error || 'Failed to parse experience')
      }
    } catch (error: any) {
      console.error('AI parsing error:', error)
      toast.error("Failed to parse experience. Please try again or fill manually.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI Experience Auto-Fill
          </DialogTitle>
          <DialogDescription>
            Paste your experience text below and AI will automatically structure it into the required format for your {roleType} application.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Tips for best results:</p>
                <ul className="list-disc list-inside space-y-1">
                  {roleType === "chair" ? (
                    <>
                      <li>Include conference names, your positions, and years</li>
                      <li>Mention any awards or achievements</li>
                      <li>Describe your responsibilities and impact</li>
                    </>
                  ) : (
                    <>
                      <li>Include organization names, your roles, and years</li>
                      <li>Mention leadership positions and responsibilities</li>
                      <li>Include event organization or administrative experience</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="experienceText">Your Experience (Free Text)</Label>
            <Textarea
              id="experienceText"
              value={experienceText}
              onChange={(e) => setExperienceText(e.target.value)}
              placeholder={roleType === "chair" 
                ? "Example: I was a chair at Harvard MUN 2023 where I led the Security Council committee. I also participated as a delegate in Oxford MUN 2022 representing France in the General Assembly. In 2024, I was deputy chair at Dubai MUN..."
                : "Example: I served as Student Council President at my school in 2023, organizing multiple events with 500+ attendees. I was also the Event Coordinator for our school's annual cultural festival in 2022, managing logistics and volunteer teams..."
              }
              className="min-h-[150px]"
              disabled={isProcessing}
            />
            <p className="text-xs text-gray-500">
              {experienceText.length} characters
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button 
              onClick={handleAIParsing} 
              disabled={isProcessing || !experienceText.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Auto-Fill Experience
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
