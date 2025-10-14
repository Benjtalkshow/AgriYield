"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface InvestorsTableProps {
  farmId: string
}

// Mock investor data
const mockInvestors = [
  { address: "0x742d...5e8a", amount: 5000, date: "2024-01-15" },
  { address: "0x8f3c...2b9d", amount: 2500, date: "2024-01-14" },
  { address: "0x1a5e...7c4f", amount: 10000, date: "2024-01-13" },
  { address: "0x9d2b...3e1a", amount: 1500, date: "2024-01-12" },
  { address: "0x4c7f...8a2d", amount: 3000, date: "2024-01-11" },
]

export function InvestorsTable({ farmId }: InvestorsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Investor</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="text-right">Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {mockInvestors.map((investor, index) => (
          <TableRow key={index}>
            <TableCell>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">{investor.address.substring(2, 4).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="font-mono text-sm">{investor.address}</span>
              </div>
            </TableCell>
            <TableCell className="text-right font-semibold">${investor.amount.toLocaleString()}</TableCell>
            <TableCell className="text-right text-sm text-muted-foreground">{investor.date}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
