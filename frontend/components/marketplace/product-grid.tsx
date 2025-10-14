"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Package, ShoppingCart, Eye } from "lucide-react"
import { useState } from "react"
import { ProductModal } from "./product-modal"

const products = [
  {
    id: 1,
    name: "Organic Wheat",
    category: "grains",
    farm: "Organic Wheat Farm",
    location: "Iowa, USA",
    price: 45,
    unit: "per 50kg bag",
    quantity: 120,
    image: "/golden-wheat-farm.png",
    description: "Premium organic wheat from our certified farm. Perfect for baking and milling.",
    harvestDate: "2025-01-15",
    certification: "USDA Organic",
  },
  {
    id: 2,
    name: "Premium Rice",
    category: "grains",
    farm: "Premium Rice Cultivation",
    location: "California, USA",
    price: 65,
    unit: "per 25kg bag",
    quantity: 85,
    image: "/rice-farm.jpg",
    description: "Long-grain premium rice with excellent texture and aroma.",
    harvestDate: "2025-01-20",
    certification: "Organic Certified",
  },
  {
    id: 3,
    name: "Sweet Corn",
    category: "vegetables",
    farm: "Sustainable Corn Harvest",
    location: "Nebraska, USA",
    price: 28,
    unit: "per 20kg crate",
    quantity: 200,
    image: "/corn-farm.png",
    description: "Fresh, sweet corn harvested at peak ripeness.",
    harvestDate: "2025-01-10",
    certification: "Non-GMO",
  },
  {
    id: 4,
    name: "Organic Tomatoes",
    category: "vegetables",
    farm: "Organic Tomato Farm",
    location: "Florida, USA",
    price: 35,
    unit: "per 10kg box",
    quantity: 150,
    image: "/tomato-farm.jpg",
    description: "Vine-ripened organic tomatoes with rich flavor.",
    harvestDate: "2025-01-12",
    certification: "USDA Organic",
  },
  {
    id: 5,
    name: "Soybeans",
    category: "legumes",
    farm: "Soybean Plantation",
    location: "Illinois, USA",
    price: 52,
    unit: "per 50kg bag",
    quantity: 95,
    image: "/soybean-farm.jpg",
    description: "High-protein soybeans ideal for processing and consumption.",
    harvestDate: "2025-01-18",
    certification: "Non-GMO",
  },
  {
    id: 6,
    name: "Fresh Apples",
    category: "fruits",
    farm: "Apple Orchard",
    location: "Washington, USA",
    price: 42,
    unit: "per 15kg box",
    quantity: 180,
    image: "/apple-orchard.png",
    description: "Crisp, sweet apples from our premium orchard.",
    harvestDate: "2025-01-08",
    certification: "Organic Certified",
  },
]

interface ProductGridProps {
  searchTerm: string
  categoryFilter: string
  sortBy: string
}

export function ProductGrid({ searchTerm, categoryFilter, sortBy }: ProductGridProps) {
  const [selectedProduct, setSelectedProduct] = useState<(typeof products)[0] | null>(null)

  let filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  // Sort products
  filteredProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price
    if (sortBy === "price-high") return b.price - a.price
    if (sortBy === "popular") return b.quantity - a.quantity
    return b.id - a.id // newest first
  })

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ y: -8 }}
            className="group"
          >
            <Card className="overflow-hidden h-full transition-all hover:shadow-2xl hover:border-emerald-500/50">
              <div className="relative h-56 overflow-hidden">
                <motion.img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-emerald-500/90 text-white backdrop-blur-sm">{product.certification}</Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="backdrop-blur-sm">
                    <Package className="h-3 w-3 mr-1" />
                    {product.quantity} available
                  </Badge>
                </div>
              </div>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-1 group-hover:text-emerald-600 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {product.location}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">From: {product.farm}</p>
                </div>

                <div className="flex items-end justify-between pt-2 border-t">
                  <div>
                    <div className="text-2xl font-bold text-emerald-600">${product.price}</div>
                    <div className="text-xs text-muted-foreground">{product.unit}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProduct(product)}
                      className="group-hover:border-emerald-500"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      className="gradient-primary text-white group-hover:shadow-lg transition-shadow"
                      onClick={() => setSelectedProduct(product)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Buy Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No products match your filters. Try adjusting your search criteria.</p>
          </CardContent>
        </Card>
      )}

      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </>
  )
}
