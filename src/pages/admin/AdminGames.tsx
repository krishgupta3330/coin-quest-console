import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useGames, useCreateGame, useUpdateGame, useDeleteGame, useCreateSystemLog } from "@/hooks/useDatabase";
import { 
  Gamepad2, 
  Search, 
  Plus, 
  Edit2, 
  Trash2,
  Save,
  X
} from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";

interface GameFormData {
  name: string;
  description: string;
  category: string;
  min_bet: number;
  max_bet: number;
  odds: number;
  status: 'active' | 'inactive' | 'maintenance';
}

const initialFormData: GameFormData = {
  name: "",
  description: "",
  category: "",
  min_bet: 1,
  max_bet: 1000,
  odds: 1.5,
  status: "active",
};

export default function AdminGames() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<any>(null);
  const [formData, setFormData] = useState<GameFormData>(initialFormData);
  
  const { data: games, isLoading } = useGames();
  const createGame = useCreateGame();
  const updateGame = useUpdateGame();
  const deleteGame = useDeleteGame();
  const createLog = useCreateSystemLog();

  const filteredGames = games?.filter((game) =>
    game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    game.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (game?: any) => {
    if (game) {
      setEditingGame(game);
      setFormData({
        name: game.name,
        description: game.description || "",
        category: game.category || "",
        min_bet: game.min_bet,
        max_bet: game.max_bet,
        odds: game.odds,
        status: game.status,
      });
    } else {
      setEditingGame(null);
      setFormData(initialFormData);
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingGame) {
        await updateGame.mutateAsync({
          id: editingGame.id,
          ...formData,
        });
        await createLog.mutateAsync({
          action: "update",
          entity_type: "game",
          entity_id: editingGame.id,
          description: `Updated game: ${formData.name}`,
        });
        toast.success("Game updated successfully");
      } else {
        const newGame = await createGame.mutateAsync(formData);
        await createLog.mutateAsync({
          action: "create",
          entity_type: "game",
          entity_id: newGame.id,
          description: `Created game: ${formData.name}`,
        });
        toast.success("Game created successfully");
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Failed to save game");
    }
  };

  const handleDelete = async (game: any) => {
    if (!confirm(`Are you sure you want to delete "${game.name}"?`)) return;
    
    try {
      await deleteGame.mutateAsync(game.id);
      await createLog.mutateAsync({
        action: "delete",
        entity_type: "game",
        entity_id: game.id,
        description: `Deleted game: ${game.name}`,
      });
      toast.success("Game deleted successfully");
    } catch (error) {
      toast.error("Failed to delete game");
    }
  };

  return (
    <DashboardLayout variant="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Gamepad2 className="h-8 w-8 text-primary" />
              Game Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Add, edit, and manage game configurations
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Game
          </Button>
        </div>

        {/* Search */}
        <Card className="glass">
          <CardContent className="py-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search games by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Games Table */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              All Games ({filteredGames?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Game</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Category</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Min Bet</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Max Bet</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Odds</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Created</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-muted-foreground">
                        Loading games...
                      </td>
                    </tr>
                  ) : filteredGames?.length ? (
                    filteredGames.map((game) => (
                      <tr key={game.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                              <Gamepad2 className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium">{game.name}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                                {game.description || "No description"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {game.category || "—"}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className={
                              game.status === "active"
                                ? "bg-success/10 text-success border-success/30"
                                : game.status === "maintenance"
                                ? "bg-warning/10 text-warning border-warning/30"
                                : "bg-muted text-muted-foreground"
                            }
                          >
                            {game.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          ${game.min_bet}
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          ${game.max_bet}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-primary">
                          {game.odds}x
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {format(new Date(game.created_at), "MMM dd, yyyy")}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(game)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(game)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-muted-foreground">
                        No games found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit Game Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="glass max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingGame ? "Edit Game" : "Add New Game"}</DialogTitle>
              <DialogDescription>
                {editingGame ? "Update game configuration" : "Create a new game with odds and betting limits"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="name">Game Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter game name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter game description"
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g., Slots, Cards"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="min_bet">Min Bet ($)</Label>
                    <Input
                      id="min_bet"
                      type="number"
                      value={formData.min_bet}
                      onChange={(e) => setFormData({ ...formData, min_bet: parseFloat(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_bet">Max Bet ($)</Label>
                    <Input
                      id="max_bet"
                      type="number"
                      value={formData.max_bet}
                      onChange={(e) => setFormData({ ...formData, max_bet: parseFloat(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="odds">Odds (x)</Label>
                    <Input
                      id="odds"
                      type="number"
                      step="0.1"
                      value={formData.odds}
                      onChange={(e) => setFormData({ ...formData, odds: parseFloat(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={createGame.isPending || updateGame.isPending}>
                  <Save className="h-4 w-4 mr-1" />
                  {editingGame ? "Update" : "Create"} Game
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
