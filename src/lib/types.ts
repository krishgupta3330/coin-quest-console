// Database types for the game management system

export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  total_credits: number;
  total_debits: number;
  created_at: string;
  updated_at: string;
}

export interface Game {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  min_bet: number;
  max_bet: number;
  odds: number;
  status: 'active' | 'inactive' | 'maintenance';
  rules: Record<string, unknown> | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  wallet_id: string;
  game_id: string | null;
  type: 'credit' | 'debit' | 'win' | 'loss' | 'adjustment';
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string | null;
  reference_id: string | null;
  created_at: string;
}

export interface GameHistory {
  id: string;
  user_id: string;
  game_id: string;
  transaction_id: string | null;
  bet_amount: number;
  win_amount: number;
  result: 'win' | 'loss';
  odds_at_play: number | null;
  game_data: Record<string, unknown> | null;
  played_at: string;
}

export interface Report {
  id: string;
  report_type: 'daily' | 'weekly' | 'monthly' | 'custom';
  period_start: string;
  period_end: string;
  total_bets: number;
  total_wins: number;
  total_losses: number;
  net_profit: number;
  total_transactions: number;
  report_data: Record<string, unknown> | null;
  created_at: string;
}

export interface SystemLog {
  id: string;
  user_id: string | null;
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'balance_change' | 'game_play';
  entity_type: string | null;
  entity_id: string | null;
  description: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface OperatingBalance {
  id: string;
  total_deposits: number;
  total_withdrawals: number;
  total_bets: number;
  total_payouts: number;
  operating_profit: number;
  updated_at: string;
}

// Extended types with relations
export interface TransactionWithGame extends Transaction {
  games?: Game | null;
}

export interface GameHistoryWithGame extends GameHistory {
  games?: Game | null;
}

export interface UserWithWallet extends User {
  wallets?: Wallet | null;
}
