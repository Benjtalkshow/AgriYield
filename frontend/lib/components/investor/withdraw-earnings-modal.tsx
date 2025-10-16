"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wallet, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

interface WithdrawEarningsModalProps {
  isOpen: boolean
  onClose: () => void
  availableEarnings: number
  investmentName: string
  investmentId: number
}

export function WithdrawEarningsModal({
  isOpen,
  onClose,
  availableEarnings,
  investmentName,
  investmentId,
}: WithdrawEarningsModalProps) {
  const { user } = useAuth()
  const [amount, setAmount] = useState(availableEarnings.toString())
  const [isProcessing, setIsProcessing] = useState(false)
  const [transactionComplete, setTransactionComplete] = useState(false)
  const [txHash, setTxHash] = useState("")

  const handleWithdraw = async () => {
    if (!user?.walletConnected) {
      toast.error("Please connect your wallet first")
      return
    }

    const withdrawAmount = parseFloat(amount)
    if (withdrawAmount <= 0 || withdrawAmount > availableEarnings) {
      toast.error("Invalid withdrawal amount")
      return
    }

    setIsProcessing(true)

    // Simulate blockchain transaction
    setTimeout(() => {
      // Mock transaction hash
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`
      setTxHash(mockTxHash)
      setTransactionComplete(true)
      setIsProcessing(false)

      toast.success("Withdrawal successful!", {
        description: `${withdrawAmount} AGT transferred to your wallet`,
      })

      // Auto-close after 3 seconds
      setTimeout(() => {
        handleClose()
      }, 3000)
    }, 2500)
  }

  const handleClose = () => {
    setAmount(availableEarnings.toString())
    setIsProcessing(false)
    setTransactionComplete(false)
    setTxHash("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <AnimatePresence mode="wait">
          {!transactionComplete ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  Withdraw Earnings
                </DialogTitle>
                <DialogDescription>
                  Withdraw your earnings from <span className="font-semibold">{investmentName}</span> to your connected
                  wallet.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Wallet Status */}
                {!user?.walletConnected ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800"
                  >
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">Wallet Not Connected</p>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                        Please connect your wallet to withdraw funds.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800"
                  >
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Wallet Connected</p>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1 truncate">
                        {user.walletAddress}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Available Earnings */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm text-muted-foreground">Available Earnings</Label>
                    <span className="text-lg font-bold text-primary">{availableEarnings} AGT</span>
                  </div>
                  <p className="text-xs text-muted-foreground">≈ ₦{(availableEarnings * 100).toLocaleString()}</p>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Withdrawal Amount (AGT)</Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      max={availableEarnings}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pr-20"
                      disabled={!user?.walletConnected || isProcessing}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-7 text-xs"
                      onClick={() => setAmount(availableEarnings.toString())}
                      disabled={!user?.walletConnected || isProcessing}
                    >
                      Max
                    </Button>
                  </div>
                </div>

                {/* Transaction Fee Notice */}
                <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
                  <p className="font-semibold mb-1">Transaction Details:</p>
                  <ul className="space-y-1 ml-4 list-disc">
                    <li>Network: Polygon (MATIC)</li>
                    <li>Estimated Gas Fee: ~0.001 MATIC</li>
                    <li>Token: AGT (AgriYield Token)</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleClose} className="flex-1" disabled={isProcessing}>
                  Cancel
                </Button>
                <Button
                  onClick={handleWithdraw}
                  className="flex-1 gradient-primary text-white"
                  disabled={!user?.walletConnected || isProcessing || parseFloat(amount) <= 0}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Confirm Withdrawal"
                  )}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="text-center py-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center mb-4"
              >
                <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </motion.div>

              <DialogHeader>
                <DialogTitle className="text-center">Withdrawal Successful!</DialogTitle>
                <DialogDescription className="text-center">
                  Your earnings have been transferred to your wallet.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-6">
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground mb-1">Amount Withdrawn</p>
                  <p className="text-2xl font-bold text-primary">{amount} AGT</p>
                  <p className="text-xs text-muted-foreground mt-1">≈ ₦{(parseFloat(amount) * 100).toLocaleString()}</p>
                </div>

                <div className="text-left p-3 rounded-lg bg-muted/50 border">
                  <p className="text-xs font-semibold mb-1">Transaction Hash:</p>
                  <p className="text-xs font-mono text-muted-foreground break-all">{txHash}</p>
                </div>

                <Button onClick={handleClose} className="w-full gradient-primary text-white">
                  Done
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
