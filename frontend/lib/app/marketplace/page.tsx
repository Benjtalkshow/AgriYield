import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { MarketplaceContent } from "@/components/marketplace/marketplace-content"

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MarketplaceContent />
      </main>
      <Footer />
    </div>
  )
}
