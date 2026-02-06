import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useActiveGames, useGameHistory, useUsers } from "@/hooks/useDatabase";
import { Gamepad2, Trophy, Target, Zap, Clock } from "lucide-react";
import { format } from "date-fns";

export default function UserGames() {
  const { data: games, isLoading: gamesLoading } = useActiveGames();
  const { data: users } = useUsers();
  const user = users?.[0];
  const { data: gameHistory } = useGameHistory({ userId: user?.id, limit: 50 });

  // Calculate game-wise stats
  const gameStats = games?.map((game) => {
    const history = gameHistory?.filter((h) => h.game_id === game.id) || [];
    const totalPlays = history.length;
    const wins = history.filter((h) => h.result === "win").length;
    const totalBet = history.reduce((sum, h) => sum + Number(h.bet_amount), 0);
    const totalWon = history.reduce((sum, h) => sum + Number(h.win_amount), 0);
    
    return {
      ...game,
      totalPlays,
      wins,
      losses: totalPlays - wins,
      winRate: totalPlays ? ((wins / totalPlays) * 100).toFixed(0) : 0,
      totalBet,
      totalWon,
      profit: totalWon - totalBet,
    };
  });

  return (
    <DashboardLayout variant="user">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Games</h1>
          <p className="text-muted-foreground mt-1">
            Browse available games and view your performance
          </p>
        </div>

        {/* Games Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {gamesLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="glass animate-pulse">
                <CardContent className="p-6">
                  <div className="h-32 bg-muted rounded-lg" />
                </CardContent>
              </Card>
            ))
          ) : gameStats?.length ? (
            gameStats.map((game) => (
              <Card key={game.id} className="glass glass-hover group">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Gamepad2 className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{game.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">{game.category}</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-success/10 text-success border-success/30"
                    >
                      {game.odds}x
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {game.description || "No description available"}
                  </p>
                  
                  {/* Bet Range */}
                  <div className="flex items-center justify-between text-sm mb-4 pb-4 border-b border-border/50">
                    <span className="text-muted-foreground">Bet Range</span>
                    <span className="font-medium">
                      ${game.min_bet} - ${game.max_bet}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="text-lg font-bold">{game.totalPlays}</p>
                      <p className="text-xs text-muted-foreground">Plays</p>
                    </div>
                    <div className="p-2 rounded-lg bg-success/10">
                      <p className="text-lg font-bold text-success">{game.winRate}%</p>
                      <p className="text-xs text-muted-foreground">Win Rate</p>
                    </div>
                    <div className={`p-2 rounded-lg ${game.profit >= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                      <p className={`text-lg font-bold ${game.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {game.profit >= 0 ? '+' : ''}${game.profit.toFixed(0)}
                      </p>
                      <p className="text-xs text-muted-foreground">Profit</p>
                    </div>
                  </div>

                  <Button className="w-full mt-4 gap-2">
                    <Zap className="h-4 w-4" />
                    Play Now
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No games available at the moment
            </div>
          )}
        </div>

        {/* Recent Game History */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Game History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Game</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Bet</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Odds</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Result</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Win Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {gameHistory?.slice(0, 10).map((history) => (
                    <tr key={history.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 text-sm">
                        {format(new Date(history.played_at), "MMM dd, HH:mm")}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Gamepad2 className="h-4 w-4 text-primary" />
                          <span className="font-medium">{(history.games as any)?.name || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-mono">
                        ${history.bet_amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-right">
                        {history.odds_at_play || "—"}x
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant="outline"
                          className={
                            history.result === "win"
                              ? "bg-success/10 text-success border-success/30"
                              : "bg-destructive/10 text-destructive border-destructive/30"
                          }
                        >
                          <Trophy className="h-3 w-3 mr-1" />
                          {history.result}
                        </Badge>
                      </td>
                      <td
                        className={`py-3 px-4 text-sm text-right font-medium ${
                          history.result === "win" ? "text-success" : "text-muted-foreground"
                        }`}
                      >
                        {history.result === "win" ? `+$${history.win_amount.toLocaleString()}` : "—"}
                      </td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-muted-foreground">
                        No game history found
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
