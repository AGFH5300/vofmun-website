"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import * as XLSX from "xlsx"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CountrySelect } from "@/components/country-select"
import { PhoneInput } from "@/components/phone-input"
import { toast } from "sonner"
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Loader2,
  UploadCloud,
  XCircle,
  Building2,
  FileSpreadsheet,
  Info,
} from "lucide-react"

const REQUIRED_COLUMNS = [
  "Delegate Full Name",
  "Delegate Email",
  "Delegate Nationality",
  "Delegate Phone Number (with country code)",
  "Delegate Year (Drop down 6-->13)",
  "Delegate MUN Experience (number)",
  "Dietary Preference (Veg, Non-Veg, Other - please specify)",
] as const

const TEMPLATE_PATH = "/templates/School Delegate Application Template - VOFMUN I 2026.xlsx"

const initialFormState = {
  schoolName: "",
  schoolAddress: "",
  schoolEmail: "",
  schoolCountry: "",
  directorName: "",
  directorEmail: "",
  directorPhone: "",
  directorPhoneCountry: "AE",
  numFaculty: "",
  numDelegates: "",
  wantsHotels: false,
  wantsFlights: false,
  wantsAirportTransfers: false,
  wantsConferenceTransport: false,
  requests: "",
  heardAbout: "",
  termsAccepted: false,
}

type FormState = typeof initialFormState

type FormErrors = Partial<Record<keyof FormState | "spreadsheet", string>>

export function SchoolDelegationForm() {
  const [formData, setFormData] = useState<FormState>(initialFormState)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [spreadsheetFile, setSpreadsheetFile] = useState<File | null>(null)
  const [spreadsheetError, setSpreadsheetError] = useState<string | null>(null)
  const [spreadsheetSuccess, setSpreadsheetSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleInputChange = (field: keyof FormState, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    setErrors((prev) => {
      if (!prev[field]) return prev
      const { [field]: _removed, ...rest } = prev
      return rest
    })
  }

  const validateSpreadsheet = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      throw new Error("Please upload an .xlsx Excel spreadsheet using the official template.")
    }

    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: "array" })

    if (!workbook.SheetNames.length) {
      throw new Error("The uploaded spreadsheet is empty. Please use the official template.")
    }

    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(worksheet, { header: 1 })
    const headerRow = rows.find((row) =>
      Array.isArray(row) && row.some((cell) => String(cell ?? "").trim().length > 0)
    )

    if (!headerRow) {
      throw new Error("Unable to read the spreadsheet header. Please ensure the template headers are present.")
    }

    const headers = headerRow.map((cell) => String(cell ?? "").trim())
    const missingColumns = REQUIRED_COLUMNS.filter((column) => !headers.includes(column))

    if (missingColumns.length > 0) {
      throw new Error(
        `The spreadsheet is missing the following required column${missingColumns.length > 1 ? "s" : ""}: ${missingColumns.join(", ")}.`
      )
    }
  }

  const handleSpreadsheetChange = async (file: File | null) => {
    setSpreadsheetError(null)
    setSpreadsheetSuccess(null)

    if (!file) {
      setSpreadsheetFile(null)
      setErrors((prev) => {
        if (!prev.spreadsheet) return prev
        const { spreadsheet, ...rest } = prev
        return rest
      })
      return
    }

    try {
      await validateSpreadsheet(file)
      setSpreadsheetFile(file)
      setSpreadsheetSuccess("Template verified. All required columns are present.")
      setErrors((prev) => {
        if (!prev.spreadsheet) return prev
        const { spreadsheet, ...rest } = prev
        return rest
      })
    } catch (error: any) {
      setSpreadsheetFile(null)
      setSpreadsheetError(error?.message ?? "Unable to validate the uploaded spreadsheet.")
      setErrors((prev) => ({
        ...prev,
        spreadsheet: error?.message ?? "Unable to validate the uploaded spreadsheet.",
      }))
    }
  }

  const handleSpreadsheetSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    await handleSpreadsheetChange(file)
  }

  const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error("Unable to read file"))
      reader.readAsDataURL(file)
    })

  const validateForm = () => {
    const newErrors: FormErrors = {}

    if (!formData.schoolName.trim()) newErrors.schoolName = "School name is required"
    if (!formData.schoolAddress.trim()) newErrors.schoolAddress = "School address is required"

    if (!formData.schoolEmail.trim()) {
      newErrors.schoolEmail = "School email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.schoolEmail.trim())) {
      newErrors.schoolEmail = "Enter a valid email address"
    }

    if (!formData.schoolCountry) newErrors.schoolCountry = "Please select a country"

    if (!formData.directorName.trim()) newErrors.directorName = "Director name is required"

    if (!formData.directorEmail.trim()) {
      newErrors.directorEmail = "Director email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.directorEmail.trim())) {
      newErrors.directorEmail = "Enter a valid email address"
    }

    if (!formData.directorPhone.trim()) {
      newErrors.directorPhone = "Director phone number is required"
    }

    const numFaculty = Number.parseInt(formData.numFaculty, 10)
    if (Number.isNaN(numFaculty) || numFaculty < 0) {
      newErrors.numFaculty = "Enter a valid number of accompanying faculty"
    }

    const numDelegates = Number.parseInt(formData.numDelegates, 10)
    if (Number.isNaN(numDelegates) || numDelegates < 0) {
      newErrors.numDelegates = "Enter a valid number of delegates"
    }

    if (!spreadsheetFile) {
      newErrors.spreadsheet = "Please upload the completed delegate spreadsheet"
    } else if (spreadsheetError) {
      newErrors.spreadsheet = spreadsheetError
    }

    if (!formData.termsAccepted) {
      newErrors.termsAccepted = "You must confirm that you agree to the terms"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const resetForm = () => {
    setFormData(initialFormState)
    setSpreadsheetFile(null)
    setSpreadsheetError(null)
    setSpreadsheetSuccess(null)
    setErrors({})
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!validateForm()) {
      toast.error("Please review the highlighted fields and try again.")
      return
    }

    if (!spreadsheetFile) {
      toast.error("A delegate spreadsheet is required before submission.")
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        schoolName: formData.schoolName.trim(),
        schoolAddress: formData.schoolAddress.trim(),
        schoolEmail: formData.schoolEmail.trim(),
        schoolCountry: formData.schoolCountry,
        directorName: formData.directorName.trim(),
        directorEmail: formData.directorEmail.trim(),
        directorPhone: formData.directorPhone.trim(),
        numFaculty: Number.parseInt(formData.numFaculty, 10),
        numDelegates: Number.parseInt(formData.numDelegates, 10),
        wantsHotels: formData.wantsHotels,
        wantsFlights: formData.wantsFlights,
        wantsAirportTransfers: formData.wantsAirportTransfers,
        wantsConferenceTransport: formData.wantsConferenceTransport,
        requests: formData.requests.trim(),
        heardAbout: formData.heardAbout.trim(),
        termsAccepted: formData.termsAccepted,
        spreadsheet: {
          fileName: spreadsheetFile.name,
          mimeType:
            spreadsheetFile.type ||
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          dataUrl: await fileToDataUrl(spreadsheetFile),
        },
      }

      const response = await fetch("/api/school-delegations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result?.message || "Unable to submit the delegation. Please try again.")
      }

      toast.success("Delegation submission received!", {
        description:
          "Thank you for registering your school delegation. Our team will be in touch shortly.",
      })

      resetForm()
    } catch (error: any) {
      console.error("School delegation submission failed", error)
      toast.error("Submission failed", {
        description: error?.message || "We couldn't process your delegation right now. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full diplomatic-shadow border-0 bg-white/95">
      <CardHeader className="space-y-3 sm:space-y-4 p-4 sm:p-6" style={ {paddingTop: "0px", paddingBottom: "0px",} }>
        <CardTitle className="text-xl sm:text-2xl font-serif text-gray-900">
          School Delegation Signup
        </CardTitle>
        <CardDescription className="text-gray-600 text-sm sm:text-base">
          Provide your school's details and upload the delegate spreadsheet using our official template.
        </CardDescription>
        <Alert className="bg-red-50 border-red-200 text-red-900">
          <Building2 className="h-5 w-5" />
          <AlertTitle>School delegation spreadsheet</AlertTitle>
          <AlertDescription className="space-y-3 text-red-800">
            <p>Please download the school delegation spreadsheet from here!</p>
            <p>
              Download the official Excel sheet from here and fill it in with the complete details of all students from your
              delegations. Please leave the column names unchanged or the Excel sheet will not be recognised/accepted by the
              submission form.
            </p>
            <Button asChild variant="outline" size="sm" className="border-red-300 text-red-800 hover:bg-red-100">
              <Link href={TEMPLATE_PATH} download>
                <Download className="mr-2 h-4 w-4" /> Download template
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      </CardHeader>
      <CardContent className="space-y-6 sm:space-y-8 p-4 sm:p-6" style={ {paddingTop: "12px", paddingBottom: "6px",} }>
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          <div className="space-y-4 sm:space-y-5">
            <h3 className="text-lg sm:text-xl font-serif font-semibold text-primary">School Details</h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <Label htmlFor="schoolName">
                  School Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="schoolName"
                  value={formData.schoolName}
                  onChange={(event) => handleInputChange("schoolName", event.target.value)}
                  placeholder="Enter your school's full name"
                  className={errors.schoolName ? "border-red-500" : ""}
                />
                {errors.schoolName && <p className="text-sm text-red-500">{errors.schoolName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="schoolAddress">
                  School Address <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="schoolAddress"
                  value={formData.schoolAddress}
                  onChange={(event) => handleInputChange("schoolAddress", event.target.value)}
                  placeholder="Enter the complete address of your school"
                  className={`min-h-[80px] ${errors.schoolAddress ? "border-red-500" : ""}`}
                />
                {errors.schoolAddress && <p className="text-sm text-red-500">{errors.schoolAddress}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schoolEmail">
                    School Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="schoolEmail"
                    type="email"
                    value={formData.schoolEmail}
                    onChange={(event) => handleInputChange("schoolEmail", event.target.value)}
                    placeholder="official@school.edu"
                    className={errors.schoolEmail ? "border-red-500" : ""}
                  />
                  {errors.schoolEmail && <p className="text-sm text-red-500">{errors.schoolEmail}</p>}
                </div>
                <div className="space-y-2">
                  <Label>
                    School Country <span className="text-red-500">*</span>
                  </Label>
                  <CountrySelect
                    value={formData.schoolCountry}
                    onValueChange={(value) => handleInputChange("schoolCountry", value)}
                    placeholder="Select country"
                    error={errors.schoolCountry}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-5">
            <h3 className="text-lg sm:text-xl font-serif font-semibold text-primary">Faculty Advisor Details</h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <Label htmlFor="directorName">
                  MUN Director / Faculty Advisor Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="directorName"
                  value={formData.directorName}
                  onChange={(event) => handleInputChange("directorName", event.target.value)}
                  placeholder="Enter the full name"
                  className={errors.directorName ? "border-red-500" : ""}
                />
                {errors.directorName && <p className="text-sm text-red-500">{errors.directorName}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="directorEmail">
                    MUN Director / Faculty Advisor Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="directorEmail"
                    type="email"
                    value={formData.directorEmail}
                    onChange={(event) => handleInputChange("directorEmail", event.target.value)}
                    placeholder="director@school.edu"
                    className={errors.directorEmail ? "border-red-500" : ""}
                  />
                  {errors.directorEmail && <p className="text-sm text-red-500">{errors.directorEmail}</p>}
                </div>
                <div className="space-y-2">
                  <Label>
                    MUN Director / Faculty Advisor Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <PhoneInput
                    value={formData.directorPhone}
                    onChange={(value) => handleInputChange("directorPhone", value)}
                    countryCode={formData.directorPhoneCountry}
                    onCountryChange={(value) => handleInputChange("directorPhoneCountry", value)}
                    placeholder="Enter phone number"
                    error={errors.directorPhone}
                  />
                  {errors.directorPhone && <p className="text-sm text-red-500">{errors.directorPhone}</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-5">
            <h3 className="text-lg sm:text-xl font-serif font-semibold text-primary">Delegation Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="numFaculty">
                  Number of MUN Directors/Faculty accompanying delegation <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="numFaculty"
                  type="number"
                  min="0"
                  value={formData.numFaculty}
                  onChange={(event) => handleInputChange("numFaculty", event.target.value)}
                  placeholder="e.g. 2"
                  className={errors.numFaculty ? "border-red-500" : ""}
                />
                {errors.numFaculty && <p className="text-sm text-red-500">{errors.numFaculty}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="numDelegates">
                  Number of Delegates Applying <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="numDelegates"
                  type="number"
                  min="0"
                  value={formData.numDelegates}
                  onChange={(event) => handleInputChange("numDelegates", event.target.value)}
                  placeholder="e.g. 15"
                  className={errors.numDelegates ? "border-red-500" : ""}
                />
                {errors.numDelegates && <p className="text-sm text-red-500">{errors.numDelegates}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-lg sm:text-xl font-serif font-semibold text-primary">Logistics support</h3>
            <p className="text-sm text-gray-600">
              Let us know if you'd like the VOFMUN team to organise any of the following for your delegation.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 hover:border-[#B22222]">
                <Checkbox
                  checked={formData.wantsHotels}
                  onCheckedChange={(checked) => handleInputChange("wantsHotels", Boolean(checked))}
                />
                <div className="space-y-1">
                  <p className="font-medium text-gray-900">Hotels</p>
                  <p className="text-sm text-gray-600">Accommodation arrangements for the delegation.</p>
                </div>
              </label>
              <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 hover:border-[#B22222]">
                <Checkbox
                  checked={formData.wantsFlights}
                  onCheckedChange={(checked) => handleInputChange("wantsFlights", Boolean(checked))}
                />
                <div className="space-y-1">
                  <p className="font-medium text-gray-900">Flights</p>
                  <p className="text-sm text-gray-600">Outbound and return flight bookings.</p>
                </div>
              </label>
              <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 hover:border-[#B22222]">
                <Checkbox
                  checked={formData.wantsAirportTransfers}
                  onCheckedChange={(checked) => handleInputChange("wantsAirportTransfers", Boolean(checked))}
                />
                <div className="space-y-1">
                  <p className="font-medium text-gray-900">Airport transfers</p>
                  <p className="text-sm text-gray-600">Transport between the airport and accommodation.</p>
                </div>
              </label>
              <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 hover:border-[#B22222]">
                <Checkbox
                  checked={formData.wantsConferenceTransport}
                  onCheckedChange={(checked) => handleInputChange("wantsConferenceTransport", Boolean(checked))}
                />
                <div className="space-y-1">
                  <p className="font-medium text-gray-900">Conference day transport</p>
                  <p className="text-sm text-gray-600">
                    Transport between the venue and accommodation on all conference days.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-5">
            <h3 className="text-lg sm:text-xl font-serif font-semibold text-primary">Delegate Spreadsheet</h3>
            <div className="space-y-3 sm:space-y-4">
              <div
                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center gap-3 ${
                  spreadsheetError ? "border-red-300 bg-red-50" : spreadsheetSuccess ? "border-green-300 bg-green-50" : "border-gray-200 bg-gray-50"
                }`}
              >
                <FileSpreadsheet className={`h-10 w-10 ${spreadsheetError ? "text-red-500" : spreadsheetSuccess ? "text-green-600" : "text-gray-500"}`} />
                <div className="space-y-1">
                  <p className="font-medium text-gray-800">Upload completed delegate spreadsheet (.xlsx)</p>
                  <p className="text-sm text-gray-600">
                    Ensure the column names remain exactly as provided in the official template.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Button type="button" onClick={() => fileInputRef.current?.click()} className="bg-[#B22222] hover:bg-[#8B0000] text-white">
                    <UploadCloud className="mr-2 h-4 w-4" /> Choose file
                  </Button>
                  {spreadsheetFile && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        handleSpreadsheetChange(null)
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ""
                        }
                      }}
                    >
                      <XCircle className="mr-2 h-4 w-4" /> Remove file
                    </Button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  className="hidden"
                  onChange={handleSpreadsheetSelect}
                />
                {spreadsheetFile && !spreadsheetError && (
                  <p className="text-sm text-gray-700 break-all">Selected file: {spreadsheetFile.name}</p>
                )}
              </div>
              {spreadsheetSuccess && (
                <div className="flex items-start gap-2 text-sm text-green-700">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                  <span>{spreadsheetSuccess}</span>
                </div>
              )}
              {spreadsheetError && (
                <div className="flex items-start gap-2 text-sm text-red-600">
                  <XCircle className="h-5 w-5 flex-shrink-0" />
                  <span>{spreadsheetError}</span>
                </div>
              )}
              {errors.spreadsheet && !spreadsheetError && (
                <p className="text-sm text-red-600">{errors.spreadsheet}</p>
              )}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 flex items-start gap-3">
                <Info className="h-5 w-5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Important</p>
                  <p className="text-sm">
                    Please ensure all delegate details are complete and that column names remain unchanged before submitting the spreadsheet.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-5">
            <h3 className="text-lg sm:text-xl font-serif font-semibold text-primary">Additional Details</h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <Label htmlFor="requests">Any Specific Requests or Notes</Label>
                <Textarea
                  id="requests"
                  value={formData.requests}
                  onChange={(event) => handleInputChange("requests", event.target.value)}
                  placeholder="Let us know about accommodation, transportation, or other special assistance requests"
                  className="min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heardAbout">How did your school hear about VOFMUN?</Label>
                <Input
                  id="heardAbout"
                  value={formData.heardAbout}
                  onChange={(event) => handleInputChange("heardAbout", event.target.value)}
                  placeholder="e.g. Social media, referral, previous attendee"
                />
              </div>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <div className="space-y-2 text-sm text-blue-800">
                  <p className="font-medium">What's next?</p>
                  <p>
                    VOFMUN will get in contact with you soon regarding payment details and procedures - please check your inbox.
                    It is possible our emails may go to your spam/junk folder, so please ensure you check those folders as well.
                  </p>
                  <p>Thanks for your interest in VOFMUN, and we look forward to seeing you and your delegates at our conference!</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-amber-800">Important Documents</h4>
              <p className="text-sm text-amber-700">
                Please review the official policies before submitting your delegation application:
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.open("/pdfs/T&Cs.pdf", "_blank")}
                  className="bg-white border-amber-300 hover:bg-amber-50 text-amber-800 hover:cursor-pointer hover:text-amber-900"
                >
                  Terms &amp; Conditions
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.open("/pdfs/CoConduct.pdf", "_blank")}
                  className="bg-white border-amber-300 hover:bg-amber-50 text-amber-800 hover:cursor-pointer hover:text-amber-900"
                >
                  Code of Conduct
                </Button>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="termsAccepted"
                checked={formData.termsAccepted}
                onCheckedChange={(checked) => handleInputChange("termsAccepted", Boolean(checked))}
                className={errors.termsAccepted ? "border-red-500" : ""}
              />
              <Label htmlFor="termsAccepted" className="text-sm text-gray-700 leading-relaxed">
                I confirm that the information provided is accurate and that our school agrees to the terms and conditions of
                VOFMUN 2026.
              </Label>
            </div>
            {errors.termsAccepted && <p className="text-sm text-red-500">{errors.termsAccepted}</p>}
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-gray-500" />
              <span>All fields marked with an asterisk (*) are required.</span>
            </div>
            <Button
              type="submit"
              className="bg-[#B22222] hover:bg-[#8B0000] text-white px-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                "Submit delegation"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
