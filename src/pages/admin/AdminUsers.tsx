import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useUsers, useUpdateWallet, useCreateSystemLog } from "@/hooks/useDatabase";
import { 
  Users, 
  Search, 
  Edit2, 
  Wallet, 
  Mail,
  Calendar,
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
import { toast } from "@/components/ui/sonner";

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<any>(null);
  const [newBalance, setNewBalance] = useState("");
  
  const { data: users, isLoading } = useUsers();
  const updateWallet = useUpdateWallet();
  const createLog = useCreateSystemLog();

  const filteredUsers = users?.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateBalance = async () => {
    if (!editingUser?.wallets?.id || !newBalance) return;

    try {
      await updateWallet.mutateAsync({
        id: editingUser.wallets.id,
        balance: parseFloat(newBalance),
      });

      await createLog.mutateAsync({
        action: "balance_change",
        user_id: editingUser.id,
        entity_type: "wallet",
        entity_id: editingUser.wallets.id,
        description: `Balance updated from $${editingUser.wallets.balance} to $${newBalance}`,
      });

      toast.success("Balance updated successfully");
      setEditingUser(null);
      setNewBalance("");
    } catch (error) {
      toast.error("Failed to update balance");
    }
  };

  return (
    <DashboardLayout variant="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Users className="h-8 w-8 text-primary" />
              User Management
            </h1>
            <p className="text-muted-foreground mt-1">
              View and manage all user accounts
            </p>
          </div>
        </div>

        {/* Search */}
        <Card className="glass">
          <CardContent className="py-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name, email, or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              All Users ({filteredUsers?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Balance</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Total Credits</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Total Debits</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Joined</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-muted-foreground">
                        Loading users...
                      </td>
                    </tr>
                  ) : filteredUsers?.length ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                              {user.full_name?.[0] || user.username[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium">{user.full_name || user.username}</p>
                              <p className="text-xs text-muted-foreground">@{user.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {user.email}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className={
                              user.status === "active"
                                ? "bg-success/10 text-success border-success/30"
                                : "bg-muted text-muted-foreground"
                            }
                          >
                            {user.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold">
                          ${user.wallets?.balance?.toLocaleString() || 0}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-success">
                          ${user.wallets?.total_credits?.toLocaleString() || 0}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-warning">
                          ${user.wallets?.total_debits?.toLocaleString() || 0}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(user.created_at), "MMM dd, yyyy")}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingUser(user);
                              setNewBalance(user.wallets?.balance?.toString() || "0");
                            }}
                            className="gap-1"
                          >
                            <Wallet className="h-4 w-4" />
                            Edit Balance
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-muted-foreground">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Edit Balance Dialog */}
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="glass">
            <DialogHeader>
              <DialogTitle>Update User Balance</DialogTitle>
              <DialogDescription>
                Manually adjust the balance for {editingUser?.full_name || editingUser?.username}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Current Balance</Label>
                  <p className="text-2xl font-bold">
                    ${editingUser?.wallets?.balance?.toLocaleString() || 0}
                  </p>
                </div>
                <div>
                  <Label htmlFor="newBalance">New Balance</Label>
                  <Input
                    id="newBalance"
                    type="number"
                    value={newBalance}
                    onChange={(e) => setNewBalance(e.target.value)}
                    placeholder="Enter new balance"
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setEditingUser(null)}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button onClick={handleUpdateBalance} disabled={updateWallet.isPending}>
                  <Save className="h-4 w-4 mr-1" />
                  Update Balance
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
