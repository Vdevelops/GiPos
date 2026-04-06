import { LandingHeader } from "@/features/landing/components/landing-header"
import { LandingTerms } from "@/features/landing/components/landing-terms"
import { LandingFooter } from "@/features/landing/components/landing-footer"

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />
      <LandingTerms />
      <LandingFooter />
    </div>
  )
}
