// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

import type React from "react"
import type { Metadata } from "next"
import { createPageMetadata } from "@/app/seo-metadata"

export const metadata: Metadata = createPageMetadata({
  title: "Delegate Signup | VOFMUN",
  description:
    "Register as a delegate for VOFMUN and complete conference signup and payment details.",
  path: "/signup",
})

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
