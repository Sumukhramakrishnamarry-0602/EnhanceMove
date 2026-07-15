"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { formatCurrency } from "@/lib/utils";

export function PipelineChart({
  data,
}: {
  data: { stage: string; count: number; value: number }[];
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Deals by stage</CardTitle>
        <CardDescription>Count and value of every deal across your pipeline stages.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(220 15% 92%)" />
              <XAxis
                dataKey="stage"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                stroke="hsl(220 9% 46%)"
              />
              <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="hsl(220 9% 46%)" allowDecimals={false} />
              <Tooltip
                cursor={{ fill: "hsl(220 18% 96%)" }}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid hsl(220 15% 90%)",
                  fontSize: 13,
                }}
                formatter={(value: number, name: string) =>
                  name === "count" ? [value, "Deals"] : [formatCurrency(value), "Value"]
                }
              />
              <Bar dataKey="count" fill="hsl(226 64% 47%)" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
