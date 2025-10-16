"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Shield, Zap, Globe, BarChart3, Lock, Sparkles } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Blockchain Security",
    description: "All transactions secured by smart contracts on the blockchain, ensuring transparency and trust.",
  },
  {
    icon: Zap,
    title: "Instant Settlements",
    description: "Automated profit distribution through smart contracts eliminates delays and intermediaries.",
  },
  {
    icon: Globe,
    title: "Global Access",
    description: "Connect with farms worldwide and diversify your agricultural investment portfolio.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Track farm performance, yields, and returns with comprehensive dashboard analytics.",
  },
  {
    icon: Lock,
    title: "Verified Farms",
    description: "Every farm undergoes rigorous verification to ensure legitimacy and quality standards.",
  },
  {
    icon: Sparkles,
    title: "Sustainable Impact",
    description: "Support sustainable agriculture practices while earning competitive returns.",
  },
]

export function WhyAgriYield() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-balance">Why AgriYield?</h2>
          <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto leading-relaxed">
            The future of agriculture investment is transparent, accessible, and powered by blockchain technology.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ y: -5 }}
              className="p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-all"
            >
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
