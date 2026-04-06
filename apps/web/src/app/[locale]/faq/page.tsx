import { LandingHeader } from "@/features/landing/components/landing-header"
import { LandingFAQ } from "@/features/landing/components/landing-faq"
import { LandingFooter } from "@/features/landing/components/landing-footer"

export default function FAQPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />
      <LandingFAQ />
      <LandingFooter />
    </div>
  )
}
