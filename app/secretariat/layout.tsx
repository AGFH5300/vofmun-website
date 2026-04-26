// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

import type React from "react"
import type { Metadata } from "next"
import { createPageMetadata } from "@/app/seo-metadata"

export const metadata: Metadata = createPageMetadata({
  title: "Secretariat | VOFMUN",
  description:
    "Meet the VOFMUN secretariat team leading conference operations, committees, logistics, media, and finance.",
  path: "/secretariat",
})

export default function SecretariatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
