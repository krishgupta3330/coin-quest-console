import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUsers, useTransactions, useGameHistory, useActiveGames } from "@/hooks/useDatabase";
import { Wallet, TrendingUp, TrendingDown, Gamepad2, Trophy, Target } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format } from "date-fns";

const DEMO_USER_ID = "demo-user-1"; // We'll use the first user as demo

export default function UserDashboard() {
  const { data: users } = useUsers();
  const user = users?.[0]; // Use first user for demo
  const { data: transactions } = useTransactions({ userId: user?.id, limit: 50 });
  const { data: gameHistory } = useGameHistory({ userId: user?.id, limit: 50 });
  const { data: games } = useActiveGames();

  const wallet = user?.wallets;
  const balance = wallet?.balance || 0;
  const totalCredits = wallet?.total_credits || 0;
  const totalDebits = wallet?.total_debits || 0;

  const wins = gameHistory?.filter(g => g.result === "win").length || 0;
  const losses = gameHistory?.filter(g => g.result === "loss").length || 0;
  const winRate = gameHistory?.length ? ((wins / gameHistory.length) * 100).toFixed(1) : "0";

  // Chart data
  const balanceHistory = transactions?.slice(0, 14).reverse().map((t, i) => ({
    date: format(new Date(t.created_at), "MMM dd"),
    balance: t.balance_after,
  })) || [];

  const gameStats = [
    { name: "Wins", value: wins, color: "hsl(142, 76%, 36%)" },
    { name: "Losses", value: losses, color: "hsl(0, 72%, 51%)" },
  ];

  return (
    <DashboardLayout variant="user">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, <span className="gradient-text">{user?.full_name || user?.username || "Player"}</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's your gaming activity overview
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Current Balance"
            value={`$${balance.toLocaleString()}`}
            icon={Wallet}
            variant="default"
            subtitle="Available funds"
          />
          <StatCard
            title="Total Credits"
            value={`$${totalCredits.toLocaleString()}`}
            icon={TrendingUp}
            variant="success"
            subtitle="All time deposits"
          />
          <StatCard
            title="Total Debits"
            value={`$${totalDebits.toLocaleString()}`}
            icon={TrendingDown}
            variant="warning"
            subtitle="All time withdrawals"
          />
          <StatCard
            title="Win Rate"
            value={`${winRate}%`}
            icon={Trophy}
            variant="info"
            subtitle={`${wins}W / ${losses}L`}
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Balance History Chart */}
          <Card className="glass lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Balance History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={balanceHistory}>
                    <defs>
                      <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
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
                      dataKey="balance"
                      stroke="hsl(174, 72%, 56%)"
                      fillOpacity={1}
                      fill="url(#colorBalance)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Win/Loss Pie Chart */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Win/Loss Ratio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                {gameHistory?.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={gameStats}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {gameStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(222, 47%, 10%)",
                          border: "1px solid hsl(222, 30%, 18%)",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground">No game data yet</p>
                )}
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <span className="text-sm">Wins ({wins})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <span className="text-sm">Losses ({losses})</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Transactions */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions?.slice(0, 5).map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          tx.type === "credit" || tx.type === "win"
                            ? "bg-success/10 text-success"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {tx.type === "credit" || tx.type === "win" ? (
                          <TrendingUp className="h-5 w-5" />
                        ) : (
                          <TrendingDown className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium capitalize">{tx.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(tx.created_at), "MMM dd, HH:mm")}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-semibold ${
                        tx.type === "credit" || tx.type === "win"
                          ? "text-success"
                          : "text-destructive"
                      }`}
                    >
                      {tx.type === "credit" || tx.type === "win" ? "+" : "-"}${Math.abs(tx.amount).toLocaleString()}
                    </span>
                  </div>
                )) || (
                  <p className="text-muted-foreground text-center py-8">No transactions yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Available Games */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Available Games</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {games?.slice(0, 5).map((game) => (
                  <div
                    key={game.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <Gamepad2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{game.name}</p>
                        <p className="text-xs text-muted-foreground">{game.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-primary">{game.odds}x</p>
                      <p className="text-xs text-muted-foreground">odds</p>
                    </div>
                  </div>
                )) || (
                  <p className="text-muted-foreground text-center py-8">No games available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
