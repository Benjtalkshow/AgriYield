"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Loader2, AlertCircle, ExternalLink } from "lucide-react"
import { useState, useEffect } from "react"

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  type: "invest" | "purchase" | "tokenize"
  amount: number
  details: string
}

type TransactionStatus = "pending" | "confirming" | "success" | "error"

export function TransactionModal({ isOpen, onClose, type, amount, details }: TransactionModalProps) {
  const [status, setStatus] = useState<TransactionStatus>("pending")
  const [txHash, setTxHash] = useState("")

  useEffect(() => {
    if (isOpen) {
      setStatus("pending")
      // Simulate transaction flow
      setTimeout(() => setStatus("confirming"), 1500)
      setTimeout(() => {
        setStatus("success")
        setTxHash("0x" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15))
      }, 4000)
    }
  }, [isOpen])

  const getStatusConfig = () => {
    switch (status) {
      case "pending":
        return {
          icon: <Loader2 className="h-16 w-16 text-emerald-600 animate-spin" />,
          title: "Waiting for Confirmation",
          description: "Please confirm the transaction in your wallet",
          color: "text-emerald-600",
        }
      case "confirming":
        return {
          icon: <Loader2 className="h-16 w-16 text-cyan-600 animate-spin" />,
          title: "Transaction Pending",
          description: "Your transaction is being processed on the blockchain",
          color: "text-cyan-600",
        }
      case "success":
        return {
          icon: <CheckCircle2 className="h-16 w-16 text-emerald-600" />,
          title: "Transaction Successful!",
          description: "Your transaction has been confirmed on the blockchain",
          color: "text-emerald-600",
        }
      case "error":
        return {
          icon: <AlertCircle className="h-16 w-16 text-red-600" />,
          title: "Transaction Failed",
          description: "There was an error processing your transaction",
          color: "text-red-600",
        }
    }
  }

  const config = getStatusConfig()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={status}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <DialogHeader>
              <DialogTitle className="text-2xl">Transaction Status</DialogTitle>
            </DialogHeader>

            <div className="space-y-6 mt-6">
              {/* Status Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="flex justify-center"
              >
                {config.icon}
              </motion.div>

              {/* Status Text */}
              <div className="text-center space-y-2">
                <h3 className={`text-xl font-semibold ${config.color}`}>{config.title}</h3>
                <p className="text-sm text-muted-foreground">{config.description}</p>
              </div>

              {/* Transaction Details */}
              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-semibold capitalize">{type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-semibold">${amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Details:</span>
                  <span className="font-semibold text-right">{details}</span>
                </div>
                {status === "success" && txHash && (
                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Transaction Hash:</span>
                      <Button variant="link" size="sm" className="h-auto p-0 text-emerald-600">
                        <span className="font-mono text-xs">{txHash.substring(0, 10)}...</span>
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Loading Animation */}
              {(status === "pending" || status === "confirming") && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                  <div className="flex gap-2 justify-center">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="h-2 w-2 rounded-full bg-emerald-600"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Number.POSITIVE_INFINITY,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-center text-muted-foreground">
                    {status === "pending" ? "Waiting for wallet confirmation..." : "Processing on blockchain..."}
                  </p>
                </motion.div>
              )}

              {/* Action Buttons */}
              {status === "success" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <Button className="w-full gradient-primary text-white" onClick={onClose}>
                    Done
                  </Button>
                </motion.div>
              )}

              {status === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex gap-3"
                >
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button className="flex-1 gradient-primary text-white" onClick={() => setStatus("pending")}>
                    Retry
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
