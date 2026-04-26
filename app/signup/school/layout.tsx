// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

import type React from "react"
import type { Metadata } from "next"
import { createPageMetadata } from "@/app/seo-metadata"

export const metadata: Metadata = createPageMetadata({
  title: "School Delegation Signup | VOFMUN",
  description:
    "Submit a school delegation registration for VOFMUN and coordinate participant details for your institution.",
  path: "/signup/school",
})

export default function SchoolSignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
