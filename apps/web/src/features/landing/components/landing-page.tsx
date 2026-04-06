"use client"

import { LandingHeader } from "./landing-header"
import { LandingHero } from "./landing-hero"
import { LandingAbout } from "./landing-about"
import { LandingWhy } from "./landing-why"
import { LandingFeatures } from "./landing-features"
import { LandingPricing } from "./landing-pricing"
import { LandingTestimonials } from "./landing-testimonials"
import { LandingFAQ } from "./landing-faq"
import { LandingCTA } from "./landing-cta"
import { LandingFooter } from "./landing-footer"

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />
      <LandingHero />
      <LandingAbout />
      <LandingWhy />
      <LandingFeatures />
      <LandingPricing />
      <LandingTestimonials />
      <LandingFAQ />
      <LandingCTA />
      <LandingFooter />
    </div>
  )
}

