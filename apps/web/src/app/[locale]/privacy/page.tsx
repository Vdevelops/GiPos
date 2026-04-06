import { LandingHeader } from "@/features/landing/components/landing-header"
import { LandingPrivacy } from "@/features/landing/components/landing-privacy"
import { LandingFooter } from "@/features/landing/components/landing-footer"

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />
      <LandingPrivacy />
      <LandingFooter />
    </div>
  )
}
