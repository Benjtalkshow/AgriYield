"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Leaf, Users, TrendingUp, Shield } from "lucide-react"

const stats = [
  {
    icon: Leaf,
    value: "150+",
    label: "Active Farms",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Users,
    value: "2,500+",
    label: "Investors",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: TrendingUp,
    value: "$2.5M+",
    label: "Total Funded",
    color: "from-cyan-500 to-blue-500",
  },
  {
    icon: Shield,
    value: "100%",
    label: "Transparent",
    color: "from-purple-500 to-pink-500",
  },
]

export function StatsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="text-center"
            >
              <div className="flex justify-center mb-4">
                <div
                  className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                >
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="text-3xl lg:text-4xl font-bold mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
