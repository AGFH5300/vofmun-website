// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

import type { Metadata } from "next"
import { UNSCPage } from "@/components/committee-pages/unsc-page"
import { createPageMetadata } from "@/app/seo-metadata"

export const metadata: Metadata = createPageMetadata({
  title: "UNSC Committee | VOFMUN",
  description:
    "Access the VOFMUN UNSC committee page for crisis-focused agenda information and delegate prep resources.",
  path: "/committees/unsc",
})

export default function UNSC() {
  return <UNSCPage />
}
