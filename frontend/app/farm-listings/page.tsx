import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { FarmListingsContent } from "@/components/farm-listings/farm-listings-content"

export default function FarmListingsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <FarmListingsContent />
      </main>
      <Footer />
    </div>
  )
}
