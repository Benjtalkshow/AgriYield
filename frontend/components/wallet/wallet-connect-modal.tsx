"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Wallet, Loader2 } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"

interface WalletConnectModalProps {
  isOpen: boolean
  onClose: () => void
}

const wallets = [
  {
    name: "MetaMask",
    icon: "🦊",
    description: "Connect using MetaMask browser extension",
  },
  {
    name: "WalletConnect",
    icon: "🔗",
    description: "Scan with WalletConnect to connect",
  },
  {
    name: "Coinbase Wallet",
    icon: "💼",
    description: "Connect using Coinbase Wallet",
  },
  {
    name: "Trust Wallet",
    icon: "🛡️",
    description: "Connect using Trust Wallet",
  },
]

export function WalletConnectModal({ isOpen, onClose }: WalletConnectModalProps) {
  const [connecting, setConnecting] = useState<string | null>(null)
  const { connectWallet } = useAuth()

  const handleConnect = async (walletName: string) => {
    setConnecting(walletName)
    // Simulate wallet connection - generate mock address
    setTimeout(async () => {
      const mockAddress = `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`
      await connectWallet(mockAddress)
      setConnecting(null)
      onClose()
    }, 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <Wallet className="h-6 w-6 text-emerald-600" />
                Connect Wallet
              </DialogTitle>
              <DialogDescription>Choose your preferred wallet to connect to AgriYield</DialogDescription>
            </DialogHeader>

            <div className="space-y-3 mt-6">
              {wallets.map((wallet, index) => (
                <motion.div
                  key={wallet.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <Button
                    variant="outline"
                    className="w-full h-auto p-4 justify-start hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all bg-transparent"
                    onClick={() => handleConnect(wallet.name)}
                    disabled={connecting !== null}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="text-3xl">{wallet.icon}</div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold">{wallet.name}</div>
                        <div className="text-xs text-muted-foreground">{wallet.description}</div>
                      </div>
                      {connecting === wallet.name && <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />}
                    </div>
                  </Button>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="mt-6 p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground"
            >
              <p className="text-center">
                By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
              </p>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
