"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sprout, TrendingUp, Search } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900/95 via-slate-900 to-amber-900/95 dark:from-emerald-950 dark:via-slate-950 dark:to-amber-950">
      {/* Dark overlay for better text visibility */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm font-medium backdrop-blur-sm"
            >
              <Sprout className="h-4 w-4" />
              Blockchain-Powered Agriculture
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-5xl lg:text-7xl font-bold text-balance leading-tight text-white"
            >
              Empowering Farmers.{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Rewarding Investors.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl text-slate-300 text-pretty leading-relaxed"
            >
              Connect with farmers, invest in sustainable agriculture, and earn transparent returns through blockchain
              tokenization and profit-sharing.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="relative max-w-md"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search farms by crop, location, or ROI..."
                className="pl-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-slate-400 backdrop-blur-sm focus:bg-white/15"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button size="lg" className="gradient-primary text-white text-base group" asChild>
                <Link href="/farm-listings">
                  Explore Farms
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                asChild
              >
                <Link href="/signup">Connect Wallet</Link>
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex items-center gap-8 pt-4"
            >
              <div>
                <div className="text-2xl font-bold text-white">$2.5M+</div>
                <div className="text-sm text-slate-400">Total Funded</div>
              </div>
              <div className="h-12 w-px bg-white/20" />
              <div>
                <div className="text-2xl font-bold text-white">150+</div>
                <div className="text-sm text-slate-400">Active Farms</div>
              </div>
              <div className="h-12 w-px bg-white/20" />
              <div>
                <div className="text-2xl font-bold text-white">12%</div>
                <div className="text-sm text-slate-400">Avg. ROI</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Animated Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-square">
              {/* Glassmorphic cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="absolute top-0 right-0 w-64 p-6 rounded-2xl glass backdrop-blur-xl bg-slate-900/90 border border-emerald-500/30 shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                    <Sprout className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Organic Wheat</div>
                    <div className="font-semibold text-white">Farm #2847</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">ROI</span>
                    <span className="font-semibold text-emerald-400">14.5%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Duration</span>
                    <span className="font-semibold text-white">6 months</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 mt-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "75%" }}
                      transition={{ delay: 1.2, duration: 1 }}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full"
                    />
                  </div>
                  <div className="text-xs text-slate-400 text-right">75% Funded</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="absolute bottom-0 left-0 w-64 p-6 rounded-2xl glass backdrop-blur-xl bg-slate-900/90 border border-amber-500/30 shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Your Portfolio</div>
                    <div className="font-semibold text-white">$12,450</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Total Earnings</span>
                    <span className="font-semibold text-emerald-400">+$1,847</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Active Farms</span>
                    <span className="font-semibold text-white">8</span>
                  </div>
                </div>
              </motion.div>

              {/* Center illustration placeholder */}
              <motion.div
                animate={{
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <div className="w-48 h-48 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-400/20 blur-2xl" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
