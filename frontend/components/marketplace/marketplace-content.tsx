"use client"

import { motion } from "framer-motion"
import { ProductGrid } from "./product-grid"
import { MarketplaceFilters } from "./marketplace-filters"
import { useState } from "react"

export function MarketplaceContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-4xl font-bold mb-2">Marketplace</h1>
        <p className="text-muted-foreground text-lg">
          Buy fresh, post-harvest produce directly from tokenized farms on the blockchain.
        </p>
      </div>

      <MarketplaceFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      <ProductGrid searchTerm={searchTerm} categoryFilter={categoryFilter} sortBy={sortBy} />
    </motion.div>
  )
}
