import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStats, useTransactions, useSystemLogs } from "@/hooks/useDatabase";
import { 
  Users, 
  Gamepad2, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  PieChart,
  ArrowUpRight
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend 
} from "recharts";
import { format, subDays } from "date-fns";

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: transactions } = useTransactions({ limit: 100 });
  const { data: logs } = useSystemLogs(10);

  // Generate chart data from transactions
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, "yyyy-MM-dd");
    
    const dayTransactions = transactions?.filter(
      (t) => t.created_at.startsWith(dateStr)
    ) || [];

    const deposits = dayTransactions
      .filter((t) => t.type === "credit")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const withdrawals = dayTransactions
      .filter((t) => t.type === "debit")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const bets = dayTransactions
      .filter((t) => t.type === "loss")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const payouts = dayTransactions
      .filter((t) => t.type === "win")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      date: format(date, "EEE"),
      deposits,
      withdrawals,
      profit: bets - payouts,
    };
  });

  return (
    <DashboardLayout variant="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            System overview and key metrics
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon={Users}
            variant="info"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Active Games"
            value={stats?.activeGames || 0}
            icon={Gamepad2}
            variant="default"
          />
          <StatCard
            title="Total Deposits"
            value={`$${(stats?.totalDeposits || 0).toLocaleString()}`}
            icon={TrendingUp}
            variant="success"
          />
          <StatCard
            title="Net Profit"
            value={`$${(stats?.netProfit || 0).toLocaleString()}`}
            icon={DollarSign}
            variant={stats?.netProfit && stats.netProfit >= 0 ? "success" : "destructive"}
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Total Withdrawals"
            value={`$${(stats?.totalWithdrawals || 0).toLocaleString()}`}
            icon={TrendingDown}
            variant="warning"
          />
          <StatCard
            title="Total Bets"
            value={`$${(stats?.totalBets || 0).toLocaleString()}`}
            icon={PieChart}
          />
          <StatCard
            title="Total Payouts"
            value={`$${(stats?.totalWins || 0).toLocaleString()}`}
            icon={ArrowUpRight}
            variant="info"
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Revenue Chart */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">7-Day Financial Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
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
                    <Bar dataKey="deposits" name="Deposits" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="withdrawals" name="Withdrawals" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="profit" name="Profit" fill="hsl(174, 72%, 56%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Profit Trend Chart */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Profit Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={last7Days}>
                    <defs>
                      <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(174, 72%, 56%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(174, 72%, 56%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
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
                    <Area
                      type="monotone"
                      dataKey="profit"
                      stroke="hsl(174, 72%, 56%)"
                      fillOpacity={1}
                      fill="url(#colorProfit)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Recent System Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {logs?.length ? (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          log.action === "create"
                            ? "bg-success"
                            : log.action === "delete"
                            ? "bg-destructive"
                            : log.action === "update"
                            ? "bg-warning"
                            : "bg-info"
                        }`}
                      />
                      <div>
                        <p className="font-medium capitalize">
                          {log.action.replace("_", " ")} - {log.entity_type || "System"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {log.description || "No description"}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(log.created_at), "MMM dd, HH:mm")}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
