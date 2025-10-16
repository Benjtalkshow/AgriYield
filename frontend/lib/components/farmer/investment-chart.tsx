"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"

const data = [
  { campaign: "Wheat #1", amount: 12000 },
  { campaign: "Corn #2", amount: 18500 },
  { campaign: "Rice #3", amount: 14730 },
]

export function InvestmentChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Investment by Campaign</CardTitle>
        <CardDescription>Total funding received per campaign</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="campaign" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="amount" fill="#10b981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
