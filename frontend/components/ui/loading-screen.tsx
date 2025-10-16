"use client"

import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

interface LoadingScreenProps {
  message?: string
}

export function LoadingScreen({ message = "Loading..." }: LoadingScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:from-emerald-950 dark:via-slate-900 dark:to-amber-950"
    >
      <div className="text-center space-y-6">
        {/* Animated Logo/Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-4 border-emerald-200 dark:border-emerald-800 border-t-emerald-600 dark:border-t-emerald-400"
          />
          <Loader2 className="h-16 w-16 mx-auto text-emerald-600 dark:text-emerald-400" />
        </motion.div>

        {/* Loading Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <p className="text-lg font-semibold text-foreground">{message}</p>
          <motion.div
            className="flex justify-center gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-400"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}

// Mini loading bar for top of screen during route transitions
export function LoadingBar() {
  return (
    <motion.div
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      exit={{ scaleX: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-emerald-500 z-50 origin-left"
    />
  )
}
