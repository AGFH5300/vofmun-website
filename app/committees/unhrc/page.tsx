// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

import type { Metadata } from "next"
import { UNHRCPage } from "@/components/committee-pages/unhrc-page"
import { createPageMetadata } from "@/app/seo-metadata"

export const metadata: Metadata = createPageMetadata({
  title: "UNHRC Committee | VOFMUN",
  description:
    "Review the VOFMUN UNHRC committee overview, topic focus, and resources for delegates preparing for debate.",
  path: "/committees/unhrc",
})

export default function UNHRC() {
  return <UNHRCPage />
}
