// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

import type { Metadata } from "next"
import { EcosocPage } from "@/components/committee-pages/ecosoc-page"
import { createPageMetadata } from "@/app/seo-metadata"

export const metadata: Metadata = createPageMetadata({
  title: "ECOSOC Committee | VOFMUN",
  description:
    "Learn about the VOFMUN ECOSOC committee, including agenda focus and materials for delegate preparation.",
  path: "/committees/ecosoc",
})

export default function Ecosoc() {
  return <EcosocPage />
}
