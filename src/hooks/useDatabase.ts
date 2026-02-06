import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  User,
  Wallet,
  Game,
  Transaction,
  GameHistory,
  Report,
  SystemLog,
  OperatingBalance,
  UserWithWallet,
  TransactionWithGame,
  GameHistoryWithGame,
} from "@/lib/types";

// Users
export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*, wallets(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as UserWithWallet[];
    },
  });
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: ["users", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*, wallets(*)")
        .eq("id", userId)
        .single();
      if (error) throw error;
      return data as UserWithWallet;
    },
    enabled: !!userId,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: Omit<User, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("users")
        .insert(user)
        .select()
        .single();
      if (error) throw error;
      
      // Create wallet for user
      await supabase.from("wallets").insert({ user_id: data.id });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...user }: Partial<User> & { id: string }) => {
      const { data, error } = await supabase
        .from("users")
        .update(user)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// Wallets
export function useWallet(userId: string) {
  return useQuery({
    queryKey: ["wallets", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", userId)
        .single();
      if (error) throw error;
      return data as Wallet;
    },
    enabled: !!userId,
  });
}

export function useUpdateWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, balance }: { id: string; balance: number }) => {
      const { data: wallet, error: fetchError } = await supabase
        .from("wallets")
        .select("*")
        .eq("id", id)
        .single();
      if (fetchError) throw fetchError;

      const diff = balance - (wallet.balance || 0);
      const updates: Partial<Wallet> = { balance };
      
      if (diff > 0) {
        updates.total_credits = (wallet.total_credits || 0) + diff;
      } else {
        updates.total_debits = (wallet.total_debits || 0) + Math.abs(diff);
      }

      const { data, error } = await supabase
        .from("wallets")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// Games
export function useGames() {
  return useQuery({
    queryKey: ["games"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Game[];
    },
  });
}

export function useActiveGames() {
  return useQuery({
    queryKey: ["games", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("status", "active")
        .order("name");
      if (error) throw error;
      return data as Game[];
    },
  });
}

export function useCreateGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (game: { name: string; description?: string; category?: string; min_bet?: number; max_bet?: number; odds?: number; status?: 'active' | 'inactive' | 'maintenance'; image_url?: string }) => {
      const { data, error } = await supabase
        .from("games")
        .insert({
          name: game.name,
          description: game.description,
          category: game.category,
          min_bet: game.min_bet,
          max_bet: game.max_bet,
          odds: game.odds,
          status: game.status,
          image_url: game.image_url,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
    },
  });
}

export function useUpdateGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name, description, category, min_bet, max_bet, odds, status, image_url }: { id: string; name?: string; description?: string; category?: string; min_bet?: number; max_bet?: number; odds?: number; status?: 'active' | 'inactive' | 'maintenance'; image_url?: string }) => {
      const { data, error } = await supabase
        .from("games")
        .update({ name, description, category, min_bet, max_bet, odds, status, image_url })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
    },
  });
}

export function useDeleteGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("games").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
    },
  });
}

// Transactions
export function useTransactions(filters?: { userId?: string; gameId?: string; limit?: number }) {
  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: async () => {
      let query = supabase
        .from("transactions")
        .select("*, games(*)")
        .order("created_at", { ascending: false });

      if (filters?.userId) {
        query = query.eq("user_id", filters.userId);
      }
      if (filters?.gameId) {
        query = query.eq("game_id", filters.gameId);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TransactionWithGame[];
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (transaction: Omit<Transaction, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("transactions")
        .insert(transaction)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
    },
  });
}

// Game History
export function useGameHistory(filters?: { userId?: string; gameId?: string; limit?: number }) {
  return useQuery({
    queryKey: ["game_history", filters],
    queryFn: async () => {
      let query = supabase
        .from("game_history")
        .select("*, games(*)")
        .order("played_at", { ascending: false });

      if (filters?.userId) {
        query = query.eq("user_id", filters.userId);
      }
      if (filters?.gameId) {
        query = query.eq("game_id", filters.gameId);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as GameHistoryWithGame[];
    },
  });
}

// Reports
export function useReports() {
  return useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Report[];
    },
  });
}

// System Logs
export function useSystemLogs(limit = 100) {
  return useQuery({
    queryKey: ["system_logs", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data as SystemLog[];
    },
  });
}

export function useCreateSystemLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (log: { action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'balance_change' | 'game_play'; user_id?: string; entity_type?: string; entity_id?: string; description?: string; ip_address?: string }) => {
      const { data, error } = await supabase
        .from("system_logs")
        .insert({
          action: log.action,
          user_id: log.user_id,
          entity_type: log.entity_type,
          entity_id: log.entity_id,
          description: log.description,
          ip_address: log.ip_address,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system_logs"] });
    },
  });
}

// Operating Balance
export function useOperatingBalance() {
  return useQuery({
    queryKey: ["operating_balance"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("operating_balance")
        .select("*")
        .single();
      if (error) throw error;
      return data as OperatingBalance;
    },
  });
}

// Dashboard Stats
export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard_stats"],
    queryFn: async () => {
      const [users, games, transactions, gameHistory] = await Promise.all([
        supabase.from("users").select("id", { count: "exact" }),
        supabase.from("games").select("id", { count: "exact" }).eq("status", "active"),
        supabase.from("transactions").select("amount, type").order("created_at", { ascending: false }).limit(1000),
        supabase.from("game_history").select("bet_amount, win_amount, result").limit(1000),
      ]);

      const totalDeposits = transactions.data
        ?.filter((t) => t.type === "credit")
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      const totalWithdrawals = transactions.data
        ?.filter((t) => t.type === "debit")
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      const totalBets = gameHistory.data?.reduce((sum, g) => sum + Number(g.bet_amount), 0) || 0;
      const totalWins = gameHistory.data?.reduce((sum, g) => sum + Number(g.win_amount), 0) || 0;
      const winRate = gameHistory.data?.length 
        ? (gameHistory.data.filter((g) => g.result === "win").length / gameHistory.data.length) * 100 
        : 0;

      return {
        totalUsers: users.count || 0,
        activeGames: games.count || 0,
        totalDeposits,
        totalWithdrawals,
        totalBets,
        totalWins,
        netProfit: totalBets - totalWins,
        winRate: winRate.toFixed(1),
        totalTransactions: transactions.data?.length || 0,
      };
    },
  });
}
