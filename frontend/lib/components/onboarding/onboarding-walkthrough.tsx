"use client"

import React from "react"

import type { ReactElement } from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, Sprout, Coins, TrendingUp } from "lucide-react"

interface OnboardingWalkthroughProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

const slides = [
  {
    icon: Sprout,
    title: "Tokenize Farmland",
    description:
      "Transform agricultural investments into digital tokens. Farmers can tokenize their farms to raise capital, while maintaining ownership and control.",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900",
  },
  {
    icon: Coins,
    title: "Invest with AGT",
    description:
      "Purchase AGT tokens to invest in verified farms across Nigeria. Each token represents a share in the farm's future harvest and profits.",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900",
  },
  {
    icon: TrendingUp,
    title: "Earn & Track Profits",
    description:
      "Monitor your investments in real-time through your dashboard. Receive payouts in AGT tokens based on harvest yields and ROI projections.",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900",
  },
]

export function OnboardingWalkthrough({ isOpen, onClose, onComplete }: OnboardingWalkthroughProps): ReactElement {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(0)

  useEffect(() => {
    if (!isOpen) {
      setCurrentSlide(0)
    }
  }, [isOpen])

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setDirection(1)
      setCurrentSlide(currentSlide + 1)
    } else {
      handleComplete()
    }
  }

  const handleSkip = () => {
    // Mark onboarding as complete when skipping
    localStorage.setItem("onboardingComplete", "true")
    onComplete()
  }

  const handleComplete = () => {
    // Mark onboarding as complete
    localStorage.setItem("onboardingComplete", "true")
    onComplete()
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
    }),
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50"
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="pointer-events-auto w-full max-w-2xl"
            >
              <Card className="border-emerald-200 dark:border-emerald-800 shadow-2xl overflow-hidden">
                <CardContent className="p-0">
                  {/* Skip Button */}
                  <div className="absolute top-4 right-4 z-10">
                    <button
                      onClick={handleSkip}
                      className="text-muted-foreground hover:text-foreground transition-colors p-2"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Slides Container */}
                  <div className="relative h-[500px] overflow-hidden">
                    <AnimatePresence initial={false} custom={direction} mode="wait">
                      <motion.div
                        key={currentSlide}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                          x: { type: "spring", stiffness: 300, damping: 30 },
                          opacity: { duration: 0.2 },
                        }}
                        className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center"
                      >
                        {/* Icon */}
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                          className={`h-24 w-24 rounded-full ${slides[currentSlide].bgColor} flex items-center justify-center mb-8`}
                        >
                          {React.createElement(slides[currentSlide].icon, {
                            className: `h-12 w-12 ${slides[currentSlide].color}`,
                          })}
                        </motion.div>

                        {/* Title */}
                        <motion.h2
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="text-3xl font-bold mb-4"
                        >
                          {slides[currentSlide].title}
                        </motion.h2>

                        {/* Description */}
                        <motion.p
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="text-lg text-muted-foreground max-w-md leading-relaxed"
                        >
                          {slides[currentSlide].description}
                        </motion.p>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Navigation */}
                  <div className="p-8 border-t">
                    <div className="flex items-center justify-between">
                      {/* Progress Dots */}
                      <div className="flex gap-2">
                        {slides.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setDirection(index > currentSlide ? 1 : -1)
                              setCurrentSlide(index)
                            }}
                            className={`h-2 rounded-full transition-all ${
                              index === currentSlide
                                ? "w-8 bg-emerald-600 dark:bg-emerald-400"
                                : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                            }`}
                          />
                        ))}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        {currentSlide < slides.length - 1 ? (
                          <>
                            <Button 
                              variant="ghost" 
                              onClick={handleSkip}
                              className="transition-all hover:scale-105"
                            >
                              Skip
                            </Button>
                            <Button 
                              onClick={handleNext} 
                              className="gradient-primary text-white btn-ripple transition-all hover:scale-105 hover:shadow-lg"
                            >
                              Next
                            </Button>
                          </>
                        ) : (
                          <Button 
                            onClick={handleComplete} 
                            className="gradient-primary text-white px-8 btn-ripple btn-shimmer transition-all hover:scale-105 hover:shadow-xl"
                          >
                            Go to Dashboard
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
