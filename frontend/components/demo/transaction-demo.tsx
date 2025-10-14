"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { TransactionModal } from "@/components/wallet/transaction-modal"
import { useState } from "react"

export function TransactionDemo() {
  const [isOpen, setIsOpen] = useState(false)
  const [txConfig, setTxConfig] = useState({
    type: "invest" as "invest" | "purchase" | "tokenize",
    amount: 0,
    details: "",
  })

  const handleDemo = (type: "invest" | "purchase" | "tokenize", amount: number, details: string) => {
    setTxConfig({ type, amount, details })
    setIsOpen(true)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Transaction Demo</CardTitle>
          <CardDescription>Test the transaction flow with different scenarios</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            className="w-full bg-transparent"
            variant="outline"
            onClick={() => handleDemo("invest", 2500, "Organic Wheat Farm")}
          >
            Demo Investment Transaction
          </Button>
          <Button
            className="w-full bg-transparent"
            variant="outline"
            onClick={() => handleDemo("purchase", 145, "3x Organic Wheat")}
          >
            Demo Purchase Transaction
          </Button>
          <Button
            className="w-full bg-transparent"
            variant="outline"
            onClick={() => handleDemo("tokenize", 25000, "New Farm Campaign")}
          >
            Demo Tokenization Transaction
          </Button>
        </CardContent>
      </Card>

      <TransactionModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        type={txConfig.type}
        amount={txConfig.amount}
        details={txConfig.details}
      />
    </>
  )
}
