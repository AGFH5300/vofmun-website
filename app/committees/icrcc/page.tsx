// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).
import type { Metadata } from "next"

import { ICRCCPage } from "@/components/committee-pages/icrcc-page"
import { createPageMetadata } from "@/app/seo-metadata"

export const metadata: Metadata = createPageMetadata({
  title: "ICRCC Committee | VOFMUN",
  description:
    "Review the VOFMUN ICRCC committee details for cybersecurity crisis debate, agenda context, and preparation.",
  path: "/committees/icrcc",
})

export default function ICRCC() {
  return <ICRCCPage />
}
