"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Upload, Coins, TrendingUp, ShoppingBag } from "lucide-react"

const steps = [
  {
    icon: Upload,
    title: "Farmers List Projects",
    description:
      "Farmers tokenize their agricultural projects with transparent details about crops, duration, and expected returns.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Coins,
    title: "Investors Fund Farms",
    description:
      "Investors browse verified farms and fund projects through blockchain tokens, receiving ownership shares.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: TrendingUp,
    title: "Transparent Profit Sharing",
    description: "Smart contracts automatically distribute profits to token holders based on harvest yields and sales.",
    color: "from-cyan-500 to-blue-500",
  },
  {
    icon: ShoppingBag,
    title: "Marketplace Trading",
    description: "Post-harvest produce is sold on the on-chain marketplace, with proceeds shared among stakeholders.",
    color: "from-purple-500 to-pink-500",
  },
]

export function HowItWorks() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-balance">How It Works</h2>
          <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto leading-relaxed">
            A simple, transparent process connecting farmers with investors through blockchain technology.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              className="relative"
            >
              <div className="relative p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow">
                <div
                  className={`h-14 w-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4`}
                >
                  <step.icon className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-border to-transparent" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
