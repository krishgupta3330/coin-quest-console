import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStats, useTransactions, useGameHistory, useOperatingBalance } from "@/hooks/useDatabase";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  PieChart,
  Activity,
  Target,
  Users
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
  Legend,
  PieChart as RePieChart,
  Pie,
  Cell 
} from "recharts";
import { format, subDays, startOfWeek, startOfMonth } from "date-fns";

const COLORS = [
  "hsl(174, 72%, 56%)",
  "hsl(142, 76%, 36%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 72%, 51%)",
  "hsl(199, 89%, 48%)",
];

export default function AdminReports() {
  const { data: stats } = useDashboardStats();
  const { data: transactions } = useTransactions({ limit: 500 });
  const { data: gameHistory } = useGameHistory({ limit: 500 });
  const { data: operatingBalance } = useOperatingBalance();

  // Calculate daily data for last 14 days
  const dailyData = Array.from({ length: 14 }, (_, i) => {
    const date = subDays(new Date(), 13 - i);
    const dateStr = format(date, "yyyy-MM-dd");
    
    const dayTransactions = transactions?.filter(
      (t) => t.created_at.startsWith(dateStr)
    ) || [];

    const dayGameHistory = gameHistory?.filter(
      (g) => g.played_at.startsWith(dateStr)
    ) || [];

    return {
      date: format(date, "MMM dd"),
      deposits: dayTransactions.filter((t) => t.type === "credit").reduce((s, t) => s + Number(t.amount), 0),
      withdrawals: dayTransactions.filter((t) => t.type === "debit").reduce((s, t) => s + Number(t.amount), 0),
      bets: dayGameHistory.reduce((s, g) => s + Number(g.bet_amount), 0),
      payouts: dayGameHistory.reduce((s, g) => s + Number(g.win_amount), 0),
      profit: dayGameHistory.reduce((s, g) => s + Number(g.bet_amount) - Number(g.win_amount), 0),
      games: dayGameHistory.length,
    };
  });

  // Transaction type breakdown
  const transactionBreakdown = [
    { name: "Credits", value: transactions?.filter((t) => t.type === "credit").length || 0 },
    { name: "Debits", value: transactions?.filter((t) => t.type === "debit").length || 0 },
    { name: "Wins", value: transactions?.filter((t) => t.type === "win").length || 0 },
    { name: "Losses", value: transactions?.filter((t) => t.type === "loss").length || 0 },
  ].filter((t) => t.value > 0);

  // Weekly summary
  const weekStart = startOfWeek(new Date());
  const weeklyTransactions = transactions?.filter(
    (t) => new Date(t.created_at) >= weekStart
  ) || [];
  const weeklyCredits = weeklyTransactions.filter((t) => t.type === "credit").reduce((s, t) => s + Number(t.amount), 0);
  const weeklyDebits = weeklyTransactions.filter((t) => t.type === "debit").reduce((s, t) => s + Number(t.amount), 0);

  // Monthly summary
  const monthStart = startOfMonth(new Date());
  const monthlyTransactions = transactions?.filter(
    (t) => new Date(t.created_at) >= monthStart
  ) || [];
  const monthlyCredits = monthlyTransactions.filter((t) => t.type === "credit").reduce((s, t) => s + Number(t.amount), 0);
  const monthlyDebits = monthlyTransactions.filter((t) => t.type === "debit").reduce((s, t) => s + Number(t.amount), 0);

  return (
    <DashboardLayout variant="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Financial Reports
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive financial analytics and reporting
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Deposits"
            value={`$${(stats?.totalDeposits || 0).toLocaleString()}`}
            icon={TrendingUp}
            variant="success"
          />
          <StatCard
            title="Total Withdrawals"
            value={`$${(stats?.totalWithdrawals || 0).toLocaleString()}`}
            icon={TrendingDown}
            variant="warning"
          />
          <StatCard
            title="Total Bets"
            value={`$${(stats?.totalBets || 0).toLocaleString()}`}
            icon={Target}
          />
          <StatCard
            title="Operating Profit"
            value={`$${(stats?.netProfit || 0).toLocaleString()}`}
            icon={DollarSign}
            variant={stats?.netProfit && stats.netProfit >= 0 ? "success" : "destructive"}
          />
        </div>

        {/* Period Summaries */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-lg bg-success/10">
                  <p className="text-2xl font-bold text-success">${weeklyCredits.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Credits</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-warning/10">
                  <p className="text-2xl font-bold text-warning">${weeklyDebits.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Debits</p>
                </div>
              </div>
              <div className="mt-4 p-4 rounded-lg bg-muted/50 text-center">
                <p className={`text-xl font-bold ${weeklyCredits - weeklyDebits >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {weeklyCredits - weeklyDebits >= 0 ? '+' : ''}${(weeklyCredits - weeklyDebits).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Net Flow</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-lg bg-success/10">
                  <p className="text-2xl font-bold text-success">${monthlyCredits.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Credits</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-warning/10">
                  <p className="text-2xl font-bold text-warning">${monthlyDebits.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Debits</p>
                </div>
              </div>
              <div className="mt-4 p-4 rounded-lg bg-muted/50 text-center">
                <p className={`text-xl font-bold ${monthlyCredits - monthlyDebits >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {monthlyCredits - monthlyDebits >= 0 ? '+' : ''}${(monthlyCredits - monthlyDebits).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Net Flow</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* 14-Day Trend */}
          <Card className="glass lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">14-Day Financial Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyData}>
                    <defs>
                      <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorWithdrawals" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
                    <XAxis dataKey="date" stroke="hsl(215, 20%, 55%)" fontSize={11} />
                    <YAxis stroke="hsl(215, 20%, 55%)" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(222, 47%, 10%)",
                        border: "1px solid hsl(222, 30%, 18%)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="deposits"
                      name="Deposits"
                      stroke="hsl(142, 76%, 36%)"
                      fillOpacity={1}
                      fill="url(#colorDeposits)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="withdrawals"
                      name="Withdrawals"
                      stroke="hsl(38, 92%, 50%)"
                      fillOpacity={1}
                      fill="url(#colorWithdrawals)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Breakdown */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Transaction Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                {transactionBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={transactionBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {transactionBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(222, 47%, 10%)",
                          border: "1px solid hsl(222, 30%, 18%)",
                          borderRadius: "8px",
                        }}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No transaction data
                  </div>
                )}
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-2">
                {transactionBreakdown.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-xs">{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profit Analysis */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Daily Profit Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
                  <XAxis dataKey="date" stroke="hsl(215, 20%, 55%)" fontSize={11} />
                  <YAxis stroke="hsl(215, 20%, 55%)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(222, 47%, 10%)",
                      border: "1px solid hsl(222, 30%, 18%)",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="bets" name="Bets" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="payouts" name="Payouts" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" name="Profit" fill="hsl(174, 72%, 56%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
