import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTransactions, useUsers, useGames } from "@/hooks/useDatabase";
import { 
  History, 
  Search, 
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminTransactions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterGame, setFilterGame] = useState<string>("all");
  const [filterUser, setFilterUser] = useState<string>("all");
  
  const { data: transactions, isLoading } = useTransactions({});
  const { data: users } = useUsers();
  const { data: games } = useGames();

  // Apply filters
  const filteredTransactions = transactions?.filter((tx) => {
    const matchesSearch = tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.reference_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || tx.type === filterType;
    const matchesGame = filterGame === "all" || tx.game_id === filterGame;
    const matchesUser = filterUser === "all" || tx.user_id === filterUser;
    return matchesSearch && matchesType && matchesGame && matchesUser;
  });

  // Calculate totals
  const totalCredits = filteredTransactions
    ?.filter((tx) => tx.type === "credit" || tx.type === "win")
    .reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;

  const totalDebits = filteredTransactions
    ?.filter((tx) => tx.type === "debit" || tx.type === "loss")
    .reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;

  const exportToCSV = () => {
    if (!filteredTransactions?.length) return;
    
    const headers = ["Date", "Type", "User", "Game", "Amount", "Balance Before", "Balance After", "Description", "Reference"];
    const rows = filteredTransactions.map((tx) => [
      format(new Date(tx.created_at), "yyyy-MM-dd HH:mm:ss"),
      tx.type,
      users?.find((u) => u.id === tx.user_id)?.username || tx.user_id,
      (tx.games as any)?.name || "—",
      tx.amount,
      tx.balance_before,
      tx.balance_after,
      tx.description || "",
      tx.reference_id || "",
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  return (
    <DashboardLayout variant="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <History className="h-8 w-8 text-primary" />
              Transaction Monitoring
            </h1>
            <p className="text-muted-foreground mt-1">
              View and analyze all system transactions
            </p>
          </div>
          <Button onClick={exportToCSV} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="glass border-success/30">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Credits</p>
                  <p className="text-2xl font-bold text-success">${totalCredits.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-success/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass border-destructive/30">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Debits</p>
                  <p className="text-2xl font-bold text-destructive">${totalDebits.toLocaleString()}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-destructive/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Net Flow</p>
                  <p className={`text-2xl font-bold ${totalCredits - totalDebits >= 0 ? 'text-success' : 'text-destructive'}`}>
                    ${(totalCredits - totalDebits).toLocaleString()}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="glass">
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by description or reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                  <SelectItem value="debit">Debit</SelectItem>
                  <SelectItem value="win">Win</SelectItem>
                  <SelectItem value="loss">Loss</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterUser} onValueChange={setFilterUser}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterGame} onValueChange={setFilterGame}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="All Games" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Games</SelectItem>
                  {games?.map((game) => (
                    <SelectItem key={game.id} value={game.id}>
                      {game.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Transactions ({filteredTransactions?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Game</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Balance Before</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Balance After</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-muted-foreground">
                        Loading transactions...
                      </td>
                    </tr>
                  ) : filteredTransactions?.length ? (
                    filteredTransactions.map((tx) => {
                      const user = users?.find((u) => u.id === tx.user_id);
                      return (
                        <tr key={tx.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4 text-sm">
                            {format(new Date(tx.created_at), "MMM dd, yyyy HH:mm")}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {user?.username || "Unknown"}
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
                          <td className="py-3 px-4 text-sm">
                            {(tx.games as any)?.name || "—"}
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
                            ${tx.balance_before.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-sm text-right font-mono">
                            ${tx.balance_after.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-sm font-mono text-muted-foreground">
                            {tx.reference_id || "—"}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-muted-foreground">
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
