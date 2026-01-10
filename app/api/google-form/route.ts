import { NextRequest, NextResponse } from "next/server"

import { insertUserSchema } from "@/lib/db/schema"
import { countries } from "@/lib/countries"
import { isChairSignupClosed } from "@/lib/registration-deadlines"
import { normalizeReferralCode } from "@/lib/referral-codes"
import { createClient } from "@/utils/supabase/server"

export const runtime = "nodejs"

type RawAnswerValue = string | string[] | null | undefined
type RawAnswerMap = Record<string, RawAnswerValue>

const getWebhookSecret = () => process.env.GOOGLE_FORM_WEBHOOK_SECRET ?? ""

const toStringValue = (value: RawAnswerValue) => {
  if (Array.isArray(value)) {
    return value.find((entry) => Boolean(entry?.toString().trim()))?.toString().trim() ?? ""
  }
  return value?.toString().trim() ?? ""
}

const buildAnswerMap = (payload: any): RawAnswerMap => {
  const namedValues = payload?.namedValues && typeof payload.namedValues === "object" ? payload.namedValues : {}
  const answers = payload?.answers && typeof payload.answers === "object" ? payload.answers : {}

  return {
    ...namedValues,
    ...answers,
  }
}

const pickAnswer = (answers: RawAnswerMap, keys: string[]) => {
  for (const key of keys) {
    if (key in answers) {
      const value = toStringValue(answers[key])
      if (value) {
        return value
      }
    }
  }
  return ""
}

const normalizeBoolean = (value: string) => {
  const normalized = value.trim().toLowerCase()
  if (!normalized) return null
  if (["yes", "y", "true", "i agree", "agree"].some((entry) => normalized.includes(entry))) return true
  if (["no", "n", "false", "disagree"].some((entry) => normalized.includes(entry))) return false
  return null
}

const normalizeNationality = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return ""
  if (trimmed.length === 2) {
    return trimmed.toUpperCase()
  }

  const commonAliases: Record<string, string> = {
    uae: "AE",
    "united arab emirates": "AE",
    uk: "GB",
    "united kingdom": "GB",
    usa: "US",
    "united states": "US",
    "united states of america": "US",
  }

  const aliasMatch = commonAliases[trimmed.toLowerCase()]
  if (aliasMatch) return aliasMatch

  const match = countries.find(
    (country) => country.name.toLowerCase() === trimmed.toLowerCase(),
  )

  return match?.code ?? ""
}

const normalizeDietaryType = (value: string) => {
  const normalized = value.trim().toLowerCase()
  if (!normalized) return ""
  if (normalized.includes("non-vegetarian")) return "non-vegetarian"
  if (normalized.includes("non") && normalized.includes("vegetarian")) return "non-vegetarian"
  if (normalized.includes("vegetarian")) return "vegetarian"
  if (normalized.includes("other") || normalized.includes("vegan") || normalized.includes("halal") || normalized.includes("kosher")) {
    return "other"
  }
  return normalized
}

const normalizeYesNo = (value: string) => {
  const normalized = value.trim().toLowerCase()
  if (!normalized) return ""
  if (normalized.includes("yes")) return "yes"
  if (normalized.includes("no")) return "no"
  return normalized
}

const normalizeGrade = (value: string) => {
  const normalized = value.trim().toLowerCase()
  if (!normalized) return ""
  if (normalized.includes("university") || normalized.includes("college")) return "university"

  const digitMatch = normalized.match(/\d{1,2}/)
  return digitMatch?.[0] ?? value.trim()
}

const normalizeCommittee = (value: string) => {
  const normalized = value.trim().toLowerCase()
  if (!normalized) return ""
  if (normalized.includes("ga1") || normalized.includes("general assembly")) return "ga1"
  if (normalized.includes("unodc")) return "unodc"
  if (normalized.includes("ecosoc")) return "ecosoc"
  if (normalized.includes("who")) return "who"
  if (normalized.includes("uncstd")) return "uncstd"
  if (normalized.includes("icj")) return "icj"
  if (normalized.includes("icrcc") || normalized.includes("crisis")) return "icrcc"
  return ""
}

const normalizeExperience = (value: string) => {
  const normalized = value.trim().toLowerCase()
  if (!normalized) return ""
  if (normalized.includes("0") || normalized.includes("none")) return "none"
  if (normalized.includes("beginner") || normalized.includes("4") || normalized.includes("8")) return "beginner"
  if (normalized.includes("intermediate") || normalized.includes("9") || normalized.includes("15")) return "intermediate"
  if (normalized.includes("advanced") || normalized.includes("15+")) return "advanced"
  return ""
}

const normalizePaymentStatus = (value: string) => {
  const normalized = value.trim().toLowerCase()
  if (!normalized) return "unpaid"
  if (normalized.includes("paid") || normalized.includes("yes")) return "paid"
  if (normalized.includes("pending") || normalized.includes("processing") || normalized.includes("submitted")) return "pending"
  if (normalized.includes("unpaid") || normalized.includes("no")) return "unpaid"
  return "unpaid"
}

const splitReferralCodes = (value: string) =>
  value
    .split(/[\s,;\/]+/g)
    .map((code) => normalizeReferralCode(code))
    .filter(Boolean)

export async function POST(request: NextRequest) {
  const secret = getWebhookSecret()
  const authHeader = request.headers.get("authorization") ?? ""
  const token = authHeader.replace("Bearer", "").trim()

  if (!secret || token !== secret) {
    return NextResponse.json(
      { message: "Unauthorized request", status: "error" },
      { status: 401 },
    )
  }

  try {
    const payload = await request.json()
    const answers = buildAnswerMap(payload)

    const fullName = pickAnswer(answers, ["Full Name", "Name", "Full name"])
    const firstName = pickAnswer(answers, ["First Name", "First name"])
    const lastName = pickAnswer(answers, ["Last Name", "Last name", "Surname"])

    const resolvedName = {
      first: firstName,
      last: lastName,
    }

    if (!resolvedName.first || !resolvedName.last) {
      const parts = fullName.split(/\s+/).filter(Boolean)
      resolvedName.first = resolvedName.first || parts.shift() || ""
      resolvedName.last = resolvedName.last || parts.join(" ") || ""
    }

    const email = pickAnswer(answers, ["Email", "Email Address", "Email address"])
    const phone = pickAnswer(answers, ["Phone", "Phone Number", "Phone number", "Contact Number"])
    const nationality = normalizeNationality(
      pickAnswer(answers, ["Country", "Nationality", "Country/Nationality"]),
    )
    const school = pickAnswer(answers, ["School", "School Name", "School/Institution"])
    const grade = normalizeGrade(pickAnswer(answers, ["Grade", "Grade/Year", "Year", "Year/Grade"]))
    const dietaryType = normalizeDietaryType(
      pickAnswer(answers, ["Dietary Preferences", "Dietary Requirements", "Dietary Preference"]),
    )
    const dietaryOther = pickAnswer(answers, ["Dietary Other", "Other Dietary Requirements", "If other, please specify"])
    // --- Allergies (your Google Form uses free-text: "leave blank if none") ---
    const allergiesDetailsFromForm = pickAnswer(answers, [
      "Do you have any allergies VOFMUN should be aware of? If none, leave blank",
      "Do you have any allergies VOFMUN should be aware of? If none, leave blank.",
      "Allergy Details",
      "Allergy information",
      "If yes, specify allergies",
      "Allergies",
      "Allergy",
    ])

    const allergiesDetails = allergiesDetailsFromForm

    // If you ALSO have a yes/no allergies question in the future, we’ll respect it.
    // Otherwise derive yes/no from the free-text field.
    const hasAllergiesFromYesNo = normalizeYesNo(
      pickAnswer(answers, ["Do you have any allergies?", "Allergies (Yes/No)", "Allergies yes/no"]),
    )

    const hasAllergies =
      hasAllergiesFromYesNo ||
      (allergiesDetailsFromForm.trim().length > 0 ? "yes" : "no")

    const emergencyContactName = pickAnswer(answers, ["Emergency Contact Name", "Emergency Contact"])
    const emergencyContactPhone = pickAnswer(answers, ["Emergency Contact Phone", "Emergency Contact Number"])

    // --- Terms agreement (your Google Form uses a long statement as the question title) ---
    const agreeTerms = normalizeBoolean(
      pickAnswer(answers, [
        'By clicking "Yes" below, I agree to the VOFMUN terms and conditions, code of conduct, and conference rules.',
        'By clicking "Yes" below, I agree to the VOFMUN terms and conditions, code of conduct, and conference rules',
        "By clicking Yes below, I agree to the VOFMUN terms and conditions, code of conduct, and conference rules.",
        "I agree to the VOFMUN terms and conditions, code of conduct, and conference rules.",
        "Agree to Terms",
        "I agree to the terms",
        "Terms & Conditions",
      ]),
    )

    const agreePhotos =
      normalizeBoolean(pickAnswer(answers, ["Photo consent", "Photo Release"])) ?? false

    const committee1 = normalizeCommittee(
      pickAnswer(answers, [
        "First Choice",
        "First choice",
        "Committee Choice 1",
        "Committee Preference 1",
        "First Committee Choice",
      ]),
    )

    const committee2 = normalizeCommittee(
      pickAnswer(answers, [
        "Second Choice",
        "Second choice",
        "Committee Choice 2",
        "Committee Preference 2",
        "Second Committee Choice",
      ]),
    )

    const committee3 = normalizeCommittee(
      pickAnswer(answers, [
        "Third Choice",
        "Third choice",
        "Committee Choice 3",
        "Committee Preference 3",
        "Third Committee Choice",
      ]),
    )

    const experience = normalizeExperience(
      pickAnswer(answers, ["MUN Experience", "Previous MUN Experience"]),
    )
    const referralRaw = pickAnswer(answers, [
      'Referral Code(s) (Optional)\nEnter one or more referral codes. You can separate multiple codes with commas, spaces, or new lines. Example: AB123, CD456',
      'Referral Code(s) (Optional)\r\nEnter one or more referral codes. You can separate multiple codes with commas, spaces, or new lines. Example: AB123, CD456',
      'Referral Code(s) (Optional) Enter one or more referral codes. You can separate multiple codes with commas, spaces, or new lines. Example: AB123, CD456',
      "Referral Code(s) (Optional)",
      "Referral Code",
      "Referral Codes",
      "Referral code",
    ])

    const referralCodes = splitReferralCodes(referralRaw)

    const paymentStatus = normalizePaymentStatus(
      pickAnswer(answers, ["Payment Status", "Payment", "Paid?"]),
    )

    const role = (pickAnswer(answers, ["Role", "Registration Role"]) || "delegate").trim().toLowerCase()
    const normalizedRole = role === "chair" || role === "admin" ? role : "delegate"

    if (normalizedRole === "chair" && isChairSignupClosed()) {
      return NextResponse.json(
        { message: "Chair applications are now closed.", status: "error" },
        { status: 403 },
      )
    }

    const missingFields = [
      !resolvedName.first && "firstName",
      !resolvedName.last && "lastName",
      !email && "email",
      !phone && "phone",
      !nationality && "nationality",
      !school && "school",
      !grade && "grade",
      !dietaryType && "dietaryType",
      !hasAllergies && "hasAllergies",
      !emergencyContactName && "emergencyContactName",
      !emergencyContactPhone && "emergencyContactPhone",
      agreeTerms !== true && "agreeTerms",
    ].filter(Boolean) as string[]

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          message: "Missing required fields in Google Form submission.",
          missingFields,
          status: "error",
        },
        { status: 400 },
      )
    }

    const userData = insertUserSchema.parse({
      email,
      firstName: resolvedName.first,
      lastName: resolvedName.last,
      phone,
      role: normalizedRole as "delegate" | "chair" | "admin",
      school,
      grade,
      dietaryType,
      dietaryOther,
      hasAllergies,
      allergiesDetails,
      emergencyContactName,
      emergencyContactPhone,
      agreeTerms: agreeTerms ?? false,
      agreePhotos,
      nationality,
    })

    const delegateData = {
      experience: experience || "none",
      committee1: committee1 || "",
      committee2: committee2 || "",
      committee3: committee3 || "",
    }

    const supabase = await createClient()

    const { data: existingUser } = await supabase
      .from("users")
      .select("id, role")
      .eq("email", email)
      .maybeSingle()

    if (existingUser?.role && existingUser.role !== normalizedRole) {
      return NextResponse.json(
        {
          message: "A registration already exists with a different role for this email.",
          status: "error",
        },
        { status: 409 },
      )
    }

    const { data, error } = await supabase
      .from("users")
      .upsert(
        [
          {
            email: userData.email,
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone: userData.phone,
            role: normalizedRole as "delegate" | "chair" | "admin",
            nationality: userData.nationality,
            school: userData.school,
            grade: userData.grade,
            dietary_type: userData.dietaryType,
            dietary_other: userData.dietaryOther,
            has_allergies: userData.hasAllergies,
            allergies_details: userData.allergiesDetails,
            emergency_contact_name: userData.emergencyContactName,
            emergency_contact_phone: userData.emergencyContactPhone,
            agree_terms: userData.agreeTerms,
            agree_photos: userData.agreePhotos ?? false,
            delegate_data: normalizedRole === "delegate" ? delegateData : null,
            chair_data: null,
            admin_data: null,
            referral_codes: referralCodes.length > 0 ? referralCodes : null,
            payment_status: paymentStatus,
          },
        ],
        { onConflict: "email" },
      )
      .select()
      .single()

    if (error) {
      console.error("Failed to upsert Google Form registration", error)
      throw new Error(error.message)
    }

    return NextResponse.json(
      {
        message: "Google Form submission stored successfully.",
        userId: data?.id ?? null,
        status: "success",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Google Form webhook error", error)
    return NextResponse.json(
      { message: "Failed to process Google Form submission.", status: "error" },
      { status: 500 },
    )
  }
}
