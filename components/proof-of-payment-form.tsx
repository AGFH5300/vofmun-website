"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { UploadCloud, X, Loader2 } from "lucide-react"

const stripePaymentUrl = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_URL ?? ""
const hasStripePaymentLink = stripePaymentUrl.trim().length > 0

export function ProofOfPaymentForm() {
  const [hasPaid, setHasPaid] = useState<"yes" | "no" | "">("")
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState<"delegate" | "chair" | "admin" | "">("")
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null)
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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
      setPaymentProofFile(null)
      setPaymentProofPreview(null)
      setIsDragActive(false)
      setFullName("")
      setRole("")
      setErrors((prev) => {
        const { fullName, role, paymentProof, ...rest } = prev
        return rest
      })
    }
  }, [hasPaid, paymentProofPreview])

  const clearError = (key: string) => {
    setErrors((prev) => {
      if (!prev[key]) return prev
      const { [key]: _removed, ...rest } = prev
      return rest
    })
  }

  const handlePaymentProofSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        paymentProof: "Please upload an image file (PNG, JPG, or HEIC).",
      }))
      return
    }

    if (paymentProofPreview) {
      URL.revokeObjectURL(paymentProofPreview)
    }

    setPaymentProofFile(file)
    setPaymentProofPreview(URL.createObjectURL(file))
    clearError("paymentProof")
  }

  const resetPaymentProof = () => {
    if (paymentProofPreview) {
      URL.revokeObjectURL(paymentProofPreview)
    }
    setPaymentProofFile(null)
    setPaymentProofPreview(null)
    setIsDragActive(false)
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (!isDragActive) {
      setIsDragActive(true)
    }
  }

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragActive(false)
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragActive(false)

    const file = event.dataTransfer.files && event.dataTransfer.files[0]
    if (file) {
      handlePaymentProofSelect(file)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const newErrors: Record<string, string> = {}

    if (!hasPaid) {
      newErrors.hasPaid = "Please let us know if you've already paid"
    }

    if (hasPaid === "yes") {
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
      // Simulate a short delay to give the user feedback
      await new Promise((resolve) => setTimeout(resolve, 600))
      toast.success("Proof of payment received!", {
        description: "We'll verify your receipt and send a confirmation email soon.",
      })

      setHasPaid("")
      setFullName("")
      setRole("")
      resetPaymentProof()
      setErrors({})
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
          <p>
            Need to make a payment first? {" "}
            {hasStripePaymentLink ? (
              <Link href={stripePaymentUrl} target="_blank" className="font-semibold text-[#B22222] hover:underline">
                Use our secure Stripe checkout
              </Link>
            ) : (
              "Check the confirmation email for payment instructions"
            )}
            .
          </p>
          <p>If you have already paid, fill in the details below and upload your receipt.</p>
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
                  Yes, I've already paid
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
                    placeholder="Enter full name"
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
                  className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors duration-200 cursor-pointer ${
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
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isDragActive && (
                    <div className="absolute inset-0 rounded-xl bg-[#B22222]/10 backdrop-blur-[1px] flex flex-col items-center justify-center pointer-events-none">
                      <UploadCloud className="h-10 w-10 text-[#B22222] animate-bounce" />
                      <p className="mt-2 text-sm font-semibold text-[#B22222]">Drop image to upload</p>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
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
                      <div className="relative w-full max-w-xs overflow-hidden rounded-lg border border-green-200 bg-white shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={paymentProofPreview} alt="Payment proof preview" className="h-48 w-full object-cover" />
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
                      <p className="text-sm font-medium text-gray-700">{paymentProofFile?.name}</p>
                      <p className="text-xs text-gray-500">Click or drop another file to replace your upload.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-3">
                      <UploadCloud className="h-10 w-10 text-[#B22222]" />
                      <p className="text-sm text-gray-700">
                        Drag & drop your payment proof image here, or <span className="font-semibold text-[#B22222]">browse</span>
                      </p>
                      <p className="text-xs text-gray-500">Accepted formats: PNG, JPG, HEIC • Max size 10MB</p>
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
                When you're ready, return to this page or upload your receipt through the{" "}
                <Link href="/signup" className="font-semibold text-[#B22222] underline-offset-4 hover:underline">
                  registration form
                </Link>
                .
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <p className="text-xs text-gray-500">
              Need help? Email <a href="mailto:support@vofmun.org" className="underline">support@vofmun.org</a>
            </p>
            <Button type="submit" className="vofmun-gradient text-white" disabled={hasPaid !== "yes" || isSubmitting}>
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
