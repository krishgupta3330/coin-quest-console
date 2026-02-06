import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useTransactions, useGameHistory, useUsers, useGames } from "@/hooks/useDatabase";
import { History, Search, Filter, TrendingUp, TrendingDown, Gamepad2 } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function UserHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  
  const { data: users } = useUsers();
  const user = users?.[0];
  const { data: transactions } = useTransactions({ userId: user?.id });
  const { data: gameHistory } = useGameHistory({ userId: user?.id });
  const { data: games } = useGames();

  // Filter transactions
  const filteredTransactions = transactions?.filter((tx) => {
    const matchesSearch = tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || tx.type === filterType;
    return matchesSearch && matchesFilter;
  });

  // Filter game history
  const filteredGameHistory = gameHistory?.filter((gh) => {
    const gameName = (gh.games as any)?.name?.toLowerCase() || "";
    return gameName.includes(searchTerm.toLowerCase()) || 
           gh.result.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <DashboardLayout variant="user">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <History className="h-8 w-8 text-primary" />
              History
            </h1>
            <p className="text-muted-foreground mt-1">
              Complete record of your transactions and game history
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="glass">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search history..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="credit">Credits</SelectItem>
                  <SelectItem value="debit">Debits</SelectItem>
                  <SelectItem value="win">Wins</SelectItem>
                  <SelectItem value="loss">Losses</SelectItem>
                  <SelectItem value="adjustment">Adjustments</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="transactions" className="space-y-4">
          <TabsList className="glass">
            <TabsTrigger value="transactions" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="games" className="gap-2">
              <Gamepad2 className="h-4 w-4" />
              Game History
            </TabsTrigger>
          </TabsList>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Transaction Records ({filteredTransactions?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Description</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Reference</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Balance After</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions?.map((tx) => (
                        <tr key={tx.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4 text-sm">
                            {format(new Date(tx.created_at), "MMM dd, yyyy HH:mm")}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant="outline"
                              className={
                                tx.type === "credit" || tx.type === "win"
                                  ? "bg-success/10 text-success border-success/30"
                                  : tx.type === "debit" || tx.type === "loss"
                                  ? "bg-destructive/10 text-destructive border-destructive/30"
                                  : "bg-muted text-muted-foreground"
                              }
                            >
                              {tx.type === "credit" || tx.type === "win" ? (
                                <TrendingUp className="h-3 w-3 mr-1" />
                              ) : (
                                <TrendingDown className="h-3 w-3 mr-1" />
                              )}
                              {tx.type}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {tx.description || (tx.games as any)?.name || "—"}
                          </td>
                          <td className="py-3 px-4 text-sm font-mono text-muted-foreground">
                            {tx.reference_id || "—"}
                          </td>
                          <td
                            className={`py-3 px-4 text-sm text-right font-semibold ${
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
                      ))}
                    </tbody>
                  </table>
                  {!filteredTransactions?.length && (
                    <div className="py-12 text-center text-muted-foreground">
                      No transactions found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Game History Tab */}
          <TabsContent value="games">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Game Records ({filteredGameHistory?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Game</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Bet Amount</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Odds</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Result</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Win Amount</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Net</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGameHistory?.map((gh) => {
                        const net = gh.result === "win" 
                          ? Number(gh.win_amount) - Number(gh.bet_amount)
                          : -Number(gh.bet_amount);
                        return (
                          <tr key={gh.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                            <td className="py-3 px-4 text-sm">
                              {format(new Date(gh.played_at), "MMM dd, yyyy HH:mm")}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Gamepad2 className="h-4 w-4 text-primary" />
                                <span className="font-medium">{(gh.games as any)?.name || "Unknown"}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-right font-mono">
                              ${Number(gh.bet_amount).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-sm text-right">
                              {gh.odds_at_play || "—"}x
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Badge
                                variant="outline"
                                className={
                                  gh.result === "win"
                                    ? "bg-success/10 text-success border-success/30"
                                    : "bg-destructive/10 text-destructive border-destructive/30"
                                }
                              >
                                {gh.result}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-sm text-right font-mono text-success">
                              {gh.result === "win" ? `$${Number(gh.win_amount).toLocaleString()}` : "—"}
                            </td>
                            <td
                              className={`py-3 px-4 text-sm text-right font-semibold ${
                                net >= 0 ? "text-success" : "text-destructive"
                              }`}
                            >
                              {net >= 0 ? "+" : ""}${net.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {!filteredGameHistory?.length && (
                    <div className="py-12 text-center text-muted-foreground">
                      No game history found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
