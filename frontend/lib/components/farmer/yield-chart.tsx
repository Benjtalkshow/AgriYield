"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"

const data = [
  { month: "Jan", yield: 2400 },
  { month: "Feb", yield: 1398 },
  { month: "Mar", yield: 9800 },
  { month: "Apr", yield: 3908 },
  { month: "May", yield: 4800 },
  { month: "Jun", yield: 3800 },
  { month: "Jul", yield: 4300 },
]

export function YieldChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Yield Performance</CardTitle>
        <CardDescription>Monthly yield in kg over the last 7 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Line type="monotone" dataKey="yield" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
