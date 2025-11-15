"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { CountrySelect } from "@/components/country-select"
import { getCountryByCode } from "@/lib/countries"

interface PhoneInputProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  countryCode?: string
  onCountryChange?: (countryCode: string) => void
  error?: string
}

export function PhoneInput({
  value = "",
  onChange,
  placeholder = "Enter phone number",
  className,
  countryCode = "AE", // Default to UAE
  onCountryChange,
  error,
}: PhoneInputProps) {
  const [selectedCountryCode, setSelectedCountryCode] = useState(countryCode)

  const handleCountryChange = (newCountryCode: string) => {
    setSelectedCountryCode(newCountryCode)
    onCountryChange?.(newCountryCode)

    const phoneNumberOnly = extractPhoneNumber(value)
    const country = getCountryByCode(newCountryCode)
    if (country) {
      const newFullNumber = phoneNumberOnly ? `${country.phoneCode} ${phoneNumberOnly}` : country.phoneCode
      onChange(newFullNumber)
    }
  }

  const extractPhoneNumber = (fullNumber: string): string => {
    if (!fullNumber) return ""
    // Remove leading +<digits> and any following space(s)
    return fullNumber.replace(/^\+\d+\s*/, "").trim()
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value

    const numbersOnly = inputValue.replace(/[^\d\s\-$$$$]/g, "")

    const country = getCountryByCode(selectedCountryCode)

    if (country) {
      const fullNumber = numbersOnly ? `${country.phoneCode} ${numbersOnly}` : country.phoneCode
      onChange(fullNumber)
    }
  }

  const selectedCountry = getCountryByCode(selectedCountryCode)
  const phoneNumberOnly = extractPhoneNumber(value)

  const getPaddingLeft = (phoneCode?: string) => {
    const digits = phoneCode ? String(phoneCode).replace(/\D/g, "").length : 0
    if (digits === 0) return "16px" // fallback when no code
    if (digits === 1) return "28px" // target
    if (digits === 2) return "42px" // target
    if (digits === 3) return "48px" // target
    if (digits === 4) return "54px" // target
    return `${5 * digits + 30}px` // 5→55, 6→60, etc.
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="w-full sm:w-64 flex-shrink-0">
          <CountrySelect
            value={selectedCountryCode}
            onValueChange={handleCountryChange}
            placeholder="Select country"
            showPhoneCode={true}
            error={error}
            hideErrorMessage
          />
        </div>
        <div className="flex-1 min-w-0 relative">
          <div className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none z-10 bg-background px-1">
            {selectedCountry?.phoneCode}
          </div>
          <Input
            type="tel"
            value={phoneNumberOnly}
            onChange={handlePhoneChange}
            placeholder={placeholder}
            className={`${className} ${error ? "border-red-500 focus:border-red-500" : ""}`}
            aria-invalid={Boolean(error)}
            style={{
              paddingLeft: getPaddingLeft(selectedCountry?.phoneCode),
              paddingTop: "7px",
            }}
          />
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}