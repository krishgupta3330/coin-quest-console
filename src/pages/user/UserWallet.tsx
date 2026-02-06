import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUsers, useTransactions } from "@/hooks/useDatabase";
import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

export default function UserWallet() {
  const { data: users } = useUsers();
  const user = users?.[0];
  const { data: transactions } = useTransactions({ userId: user?.id, limit: 100 });

  const wallet = user?.wallets;
  const balance = wallet?.balance || 0;
  const totalCredits = wallet?.total_credits || 0;
  const totalDebits = wallet?.total_debits || 0;
  const netChange = totalCredits - totalDebits;

  // Last 7 days data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayStart = startOfDay(date).toISOString();
    const dayEnd = endOfDay(date).toISOString();
    
    const dayTransactions = transactions?.filter(
      (t) => t.created_at >= dayStart && t.created_at <= dayEnd
    ) || [];

    const credits = dayTransactions
      .filter((t) => t.type === "credit" || t.type === "win")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const debits = dayTransactions
      .filter((t) => t.type === "debit" || t.type === "loss")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      date: format(date, "EEE"),
      credits,
      debits,
    };
  });

  return (
    <DashboardLayout variant="user">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
            <p className="text-muted-foreground mt-1">
              Manage your balance and view transaction history
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Balance Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Available Balance"
            value={`$${balance.toLocaleString()}`}
            icon={Wallet}
            variant="default"
            className="lg:col-span-1"
          />
          <StatCard
            title="Total Credits"
            value={`$${totalCredits.toLocaleString()}`}
            icon={TrendingUp}
            variant="success"
          />
          <StatCard
            title="Total Debits"
            value={`$${totalDebits.toLocaleString()}`}
            icon={TrendingDown}
            variant="warning"
          />
          <StatCard
            title="Net Change"
            value={`${netChange >= 0 ? '+' : ''}$${netChange.toLocaleString()}`}
            icon={netChange >= 0 ? ArrowUpRight : ArrowDownRight}
            variant={netChange >= 0 ? "success" : "destructive"}
          />
        </div>

        {/* Chart */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">7-Day Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last7Days}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
                  <XAxis dataKey="date" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                  <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(222, 47%, 10%)",
                      border: "1px solid hsl(222, 30%, 18%)",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="credits" name="Credits" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="debits" name="Debits" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Description</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions?.map((tx) => (
                    <tr key={tx.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 text-sm">
                        {format(new Date(tx.created_at), "MMM dd, yyyy HH:mm")}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            tx.type === "credit" || tx.type === "win"
                              ? "bg-success/10 text-success"
                              : tx.type === "debit" || tx.type === "loss"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {tx.description || (tx.games as any)?.name || "—"}
                      </td>
                      <td
                        className={`py-3 px-4 text-sm text-right font-medium ${
                          tx.type === "credit" || tx.type === "win"
                            ? "text-success"
                            : "text-destructive"
                        }`}
                      >
                        {tx.type === "credit" || tx.type === "win" ? "+" : "-"}$
                        {Math.abs(tx.amount).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-mono">
                        ${tx.balance_after.toLocaleString()}
                      </td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-muted-foreground">
                        No transactions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
