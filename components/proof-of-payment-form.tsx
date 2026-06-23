// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { UploadCloud, X, Loader2, FileText } from "lucide-react"
import { HAS_STRIPE_PAYMENT_LINK, STRIPE_PAYMENT_URL } from "@/lib/payment-details"
import { getRequestErrorMessage } from "@/lib/http/client-errors"
import { uploadFileDirectly } from "@/lib/uploads/client"
import { validateUploadMetadata } from "@/lib/uploads/config"

const stripeButtonClasses =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-[#635bff] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-[#4f47d8] active:bg-[#423ac7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#635bff]"

export function ProofOfPaymentForm() {
  const [hasPaid, setHasPaid] = useState<"yes" | "no" | "">("")
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState<"delegate" | "chair" | "admin" | "">("")
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null)
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const dragDepthRef = useRef(0)
  const isFileDrag = (event: DragEvent | React.DragEvent<HTMLElement>) =>
    Array.from(event.dataTransfer?.types ?? []).includes("Files")
  const isSafeBlobPreviewUrl = !!paymentProofPreview && paymentProofPreview.startsWith("blob:")
  const isImagePreview = !!paymentProofFile && paymentProofFile.type.startsWith("image/")
  const safePaymentProofImagePreview = isSafeBlobPreviewUrl && isImagePreview ? paymentProofPreview : null

  useEffect(() => {
    return () => {
      if (paymentProofPreview) {
        URL.revokeObjectURL(paymentProofPreview)
      }
    }
  }, [paymentProofPreview])

  useEffect(() => {
    if (hasPaid === "no") {
      if (paymentProofPreview) {
        URL.revokeObjectURL(paymentProofPreview)
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect -- when hasPaid becomes "no", this effect intentionally resets dependent form/upload state to preserve current UX.
      setPaymentProofFile(null)
      setPaymentProofPreview(null)
      setIsDragActive(false)
      setEmail("")
      setFullName("")
      setRole("")
      setErrors((prev) => {
        const { email: _email, fullName, role, paymentProof, ...rest } = prev
        return rest
      })
    }
  }, [hasPaid, paymentProofPreview])

  const clearError = useCallback((key: string) => {
    setErrors((prev) => {
      if (!prev[key]) return prev
      const { [key]: _removed, ...rest } = prev
      return rest
    })
  }, [])

  const handlePaymentProofSelect = useCallback((file: File) => {
    const validationError = validateUploadMetadata({ purpose: "payment-proof", fileName: file.name, mimeType: file.type, size: file.size })

    if (validationError) {
      setErrors((prev) => ({
        ...prev,
        paymentProof: validationError,
      }))
      return
    }

    if (paymentProofPreview) {
      URL.revokeObjectURL(paymentProofPreview)
    }

    const objectUrl = URL.createObjectURL(file)
    setPaymentProofFile(file)
    setPaymentProofPreview(objectUrl)
    clearError("paymentProof")
  }, [clearError, paymentProofPreview])

  const resetPaymentProof = () => {
    if (paymentProofPreview) {
      URL.revokeObjectURL(paymentProofPreview)
    }
    setPaymentProofFile(null)
    setPaymentProofPreview(null)
    setIsDragActive(false)
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (!isFileDrag(event)) {
      return
    }
    event.preventDefault()
    event.stopPropagation()
    if (!isDragActive) {
      setIsDragActive(true)
    }
  }

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    if (!isFileDrag(event)) {
      return
    }
    event.preventDefault()
    event.stopPropagation()
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return
    }
    setIsDragActive(false)
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    if (!isFileDrag(event)) {
      return
    }
    event.preventDefault()
    event.stopPropagation()
    dragDepthRef.current = 0
    setIsDragActive(false)

    const file = event.dataTransfer.files && event.dataTransfer.files[0]
    if (file) {
      handlePaymentProofSelect(file)
    }
  }


  useEffect(() => {
    if (hasPaid !== "yes") {
      dragDepthRef.current = 0
      // eslint-disable-next-line react-hooks/set-state-in-effect -- this branch runs when global drag listeners are disabled and must clear overlay drag UI state.
      setIsDragActive(false)
      return
    }

    const onDragEnter = (event: DragEvent) => {
      if (!isFileDrag(event)) {
        return
      }
      event.preventDefault()
      dragDepthRef.current += 1
      setIsDragActive(true)
    }

    const onDragOver = (event: DragEvent) => {
      if (!isFileDrag(event)) {
        return
      }
      event.preventDefault()
      setIsDragActive(true)
    }

    const onDragLeave = (event: DragEvent) => {
      if (!isFileDrag(event)) {
        return
      }
      event.preventDefault()
      dragDepthRef.current = Math.max(dragDepthRef.current - 1, 0)
      if (dragDepthRef.current === 0) {
        setIsDragActive(false)
      }
    }

    const onDrop = (event: DragEvent) => {
      if (!isFileDrag(event)) {
        return
      }
      event.preventDefault()
      dragDepthRef.current = 0
      setIsDragActive(false)
      const file = event.dataTransfer?.files?.[0]
      if (file) {
        handlePaymentProofSelect(file)
      }
    }

    window.addEventListener("dragenter", onDragEnter)
    window.addEventListener("dragover", onDragOver)
    window.addEventListener("dragleave", onDragLeave)
    window.addEventListener("drop", onDrop)

    return () => {
      window.removeEventListener("dragenter", onDragEnter)
      window.removeEventListener("dragover", onDragOver)
      window.removeEventListener("dragleave", onDragLeave)
      window.removeEventListener("drop", onDrop)
    }
  }, [handlePaymentProofSelect, hasPaid])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const newErrors: Record<string, string> = {}

    if (!hasPaid) {
      newErrors.hasPaid = "Please let us know if you've already paid"
    }

    if (hasPaid === "yes") {
      const trimmedEmail = email.trim()
      if (!trimmedEmail) {
        newErrors.email = "Email is required"
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        newErrors.email = "Enter a valid email address"
      }

      if (!fullName.trim()) {
        newErrors.fullName = "Full name is required"
      }

      if (!role) {
        newErrors.role = "Please select the role associated with this payment"
      }

      if (!paymentProofFile) {
        newErrors.paymentProof = "Upload your payment receipt before submitting"
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error("Please fix the highlighted fields")
      return
    }

    if (hasPaid === "no") {
      toast.info("Complete your payment and return to upload the receipt here.")
      return
    }

    setIsSubmitting(true)
    try {
      if (!paymentProofFile) {
        throw new Error("Please attach your payment receipt before submitting")
      }

      const uploadReference = await uploadFileDirectly("payment-proof", paymentProofFile)

      const response = await fetch("/api/payment-proof", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          fullName: fullName.trim(),
          role: role as 'delegate' | 'chair' | 'admin',
          paymentProof: {
            uploadReference,
          },
        }),
      })

      const result = await response.json().catch(() => null)

      if (!response.ok) {
        const errorMessage = getRequestErrorMessage(
          response.status,
          result?.message,
          "We couldn't save your payment proof. Please try again.",
        )

        toast.error(errorMessage)
        return
      }

      toast.success("Proof of payment received!", {
        description: result?.message || "We'll verify your receipt and send a confirmation email soon.",
      })

      setHasPaid("")
      setEmail("")
      setFullName("")
      setRole("")
      resetPaymentProof()
      setErrors({})
    } catch (error) {
      const message = error instanceof Error ? error.message : "We couldn't save your payment proof. Please try again."
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-3xl mx-auto diplomatic-shadow border-0 bg-white/95">
      <CardHeader className="space-y-3 p-6">
        <CardTitle className="text-2xl font-serif text-gray-900 text-center">Proof of Payment</CardTitle>
        <CardDescription className="text-center text-gray-600">
          Upload your payment receipt so we can verify your registration quickly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 space-y-2">
          <p className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>Need to make a payment first?</span>
            {HAS_STRIPE_PAYMENT_LINK ? (
              <Link
                href={STRIPE_PAYMENT_URL}
                target="_blank"
                className={`${stripeButtonClasses} group`}
                style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif' }}
              >
                Pay with Stripe
                <span className="arrow-animated transition-transform duration-200 group-hover:translate-x-1">➜</span>
              </Link>
            ) : (
              <span className="font-semibold text-[#B22222]">Check the confirmation email for payment instructions.</span>
            )}
          </p>
          <p>If you have already paid, fill in the details below and upload your receipt.</p>
          <p className="text-amber-800 font-medium">
            Chair and admin applicants can upload payment proof only after their registration status is confirmed. If your
            registration is not confirmed yet, please wait for confirmation or contact support.
          </p>
          <p>Enter the same email you used to register so we can match your payment to your application.</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Have you already paid the conference fee? <span className="text-red-500">*</span>
            </Label>
            <RadioGroup
              value={hasPaid || undefined}
              onValueChange={(value) => {
                setHasPaid(value as "yes" | "no")
                clearError("hasPaid")
              }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="proof-has-paid-yes" />
                <Label htmlFor="proof-has-paid-yes" className="text-sm text-gray-700">
                  Yes, I&apos;ve already paid
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="proof-has-paid-no" />
                <Label htmlFor="proof-has-paid-no" className="text-sm text-gray-700">
                  Not yet
                </Label>
              </div>
            </RadioGroup>
            {errors.hasPaid && <p className="text-sm text-red-500">{errors.hasPaid}</p>}
          </div>

          {hasPaid === "yes" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="proof-email" className="text-sm font-medium text-gray-700">
                  Email Used During Registration <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="proof-email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    clearError("email")
                  }}
                  placeholder="Enter the email you registered with"
                  className={errors.email ? "border-red-500" : ""}
                  autoComplete="email"
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="proof-full-name" className="text-sm font-medium text-gray-700">
                    Full Name on Payment <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="proof-full-name"
                    value={fullName}
                    onChange={(event) => {
                      setFullName(event.target.value)
                      clearError("fullName")
                    }}
                    placeholder="Full Name (as used in signup)"
                    className={errors.fullName ? "border-red-500" : ""}
                  />
                  {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Role Associated with Payment <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={role || undefined}
                    onValueChange={(value) => {
                      setRole(value as "delegate" | "chair" | "admin")
                      clearError("role")
                    }}
                  >
                    <SelectTrigger className={errors.role ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select the role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="delegate">Delegate</SelectItem>
                      <SelectItem value="chair">Chair</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Upload Proof of Payment <span className="text-red-500">*</span>
                </Label>
                <div
                  className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors duration-200 ${
                    isDragActive
                      ? "border-[#B22222] bg-[#B22222]/5"
                      : errors.paymentProof
                        ? "border-red-500 bg-red-50"
                        : paymentProofFile
                          ? "border-green-500 bg-green-50"
                          : "border-gray-300 bg-white"
                  }`}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => {
                    fileInputRef.current?.click()
                  }}
                >
                  {isDragActive && (
                    <div className="fixed inset-0 z-50 bg-[#B22222]/10 backdrop-blur-[1px] flex flex-col items-center justify-center pointer-events-none">
                      <UploadCloud className="h-10 w-10 text-[#B22222] animate-bounce" />
                      <p className="mt-2 text-sm font-semibold text-[#B22222]">Drop file to upload</p>
                    </div>
                  )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) {
                        handlePaymentProofSelect(file)
                      }
                      event.target.value = ""
                    }}
                  />

                  {paymentProofPreview ? (
                    <div className="w-full flex flex-col items-center space-y-3">
                      {paymentProofFile?.type === "application/pdf" ? (
                        <div className="w-full max-w-sm rounded-lg border border-green-200 bg-white p-6 text-center shadow-sm space-y-4">
                          <FileText className="mx-auto h-12 w-12 text-[#B22222]" />
                          <p className="text-sm font-medium text-gray-700 break-words">{paymentProofFile?.name}</p>
                          <div className="flex flex-col sm:flex-row justify-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(event) => {
                                event.stopPropagation()
                                if (paymentProofPreview) {
                                  window.open(paymentProofPreview, "_blank", "noopener,noreferrer")
                                }
                              }}
                            >
                              View PDF
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={(event) => {
                                event.stopPropagation()
                                resetPaymentProof()
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ) : safePaymentProofImagePreview ? (
                        <div className="relative w-full max-w-xs overflow-hidden rounded-lg border border-green-200 bg-white shadow-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={safePaymentProofImagePreview} alt="Payment proof preview" className="h-48 w-full object-cover" />
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              resetPaymentProof()
                            }}
                            className="absolute top-2 right-2 inline-flex items-center space-x-1 rounded-full bg-red-600 px-3 py-1 text-xs font-medium text-white shadow"
                          >
                            <X className="h-3 w-3" />
                            <span>Remove</span>
                          </button>
                        </div>
                      ) : (
                        <div className="w-full max-w-xs rounded-lg border border-green-200 bg-white p-4 shadow-sm">
                          <div className="mb-3 flex items-center gap-2 text-green-700">
                            <FileText className="h-5 w-5" />
                            <span className="text-sm font-medium">
                              {paymentProofFile?.name ?? "Uploaded file"}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              resetPaymentProof()
                            }}
                            className="inline-flex items-center space-x-1 rounded-full bg-red-600 px-3 py-1 text-xs font-medium text-white shadow"
                          >
                            <X className="h-3 w-3" />
                            <span>Remove</span>
                          </button>
                        </div>
                      )}
                      {paymentProofFile?.type !== "application/pdf" && (
                        <p className="text-sm font-medium text-gray-700">{paymentProofFile?.name}</p>
                      )}
                      <p className="text-xs text-gray-500 text-center">
                        {paymentProofFile?.type === "application/pdf"
                          ? "Click “View PDF” to confirm the document or drop another file to replace your upload."
                          : "Click or drop another file to replace your upload."}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-3">
                      <UploadCloud className="h-10 w-10 text-[#B22222]" />
                      <p className="text-sm text-gray-700">
                        Drag & drop your payment proof file here, or <span className="font-semibold text-[#B22222]">browse</span>
                      </p>
                      <p className="text-xs text-gray-500">Accepted formats: PNG, JPG, HEIC, PDF • Max size 10MB</p>
                    </div>
                  )}
                </div>
                {errors.paymentProof && <p className="text-sm text-red-500">{errors.paymentProof}</p>}
              </div>
            </>
          )}

          {hasPaid === "no" && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 space-y-2">
              <p>You indicated you have not paid yet. Please complete the payment before uploading a receipt.</p>
              <p>
                Once you have your receipt, return to this page to upload it for verification, or you will not be permitted to attend the conference.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <p className="text-xs text-gray-500">
              Need help? Email <a href="mailto:conference@vofmun.org" className="underline">conference@vofmun.org</a>
            </p>
            <Button
              type="submit"
              className="vofmun-gradient text-white"
              disabled={hasPaid !== "yes" || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Proof"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
