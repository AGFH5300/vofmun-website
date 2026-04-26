// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

import type { Metadata } from "next"
import { UNODCPage } from "@/components/committee-pages/unodc-page"
import { createPageMetadata } from "@/app/seo-metadata"

export const metadata: Metadata = createPageMetadata({
  title: "UNODC Committee | VOFMUN",
  description:
    "See the VOFMUN UNODC committee agenda and delegate preparation resources for crime and policy debate.",
  path: "/committees/unodc",
})

export default function UNODC() {
  return <UNODCPage />
}
