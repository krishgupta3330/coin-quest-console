-- Create enums for status types
CREATE TYPE public.game_status AS ENUM ('active', 'inactive', 'maintenance');
CREATE TYPE public.transaction_type AS ENUM ('credit', 'debit', 'win', 'loss', 'adjustment');
CREATE TYPE public.log_action AS ENUM ('create', 'update', 'delete', 'login', 'logout', 'balance_change', 'game_play');

-- Users table (no auth required as per spec)
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Wallets/Balances table
CREATE TABLE public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    balance DECIMAL(15, 2) DEFAULT 0.00 NOT NULL,
    total_credits DECIMAL(15, 2) DEFAULT 0.00 NOT NULL,
    total_debits DECIMAL(15, 2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Games table
CREATE TABLE public.games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    min_bet DECIMAL(15, 2) DEFAULT 1.00,
    max_bet DECIMAL(15, 2) DEFAULT 1000.00,
    odds DECIMAL(5, 2) DEFAULT 1.50,
    status game_status DEFAULT 'active',
    rules JSONB,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Transactions table
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    wallet_id UUID REFERENCES public.wallets(id) ON DELETE CASCADE NOT NULL,
    game_id UUID REFERENCES public.games(id) ON DELETE SET NULL,
    type transaction_type NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    balance_before DECIMAL(15, 2) NOT NULL,
    balance_after DECIMAL(15, 2) NOT NULL,
    description TEXT,
    reference_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Game History table
CREATE TABLE public.game_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    bet_amount DECIMAL(15, 2) NOT NULL,
    win_amount DECIMAL(15, 2) DEFAULT 0.00,
    result TEXT NOT NULL, -- 'win' or 'loss'
    odds_at_play DECIMAL(5, 2),
    game_data JSONB,
    played_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Reports table (for generated reports)
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'custom'
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    total_bets DECIMAL(15, 2) DEFAULT 0.00,
    total_wins DECIMAL(15, 2) DEFAULT 0.00,
    total_losses DECIMAL(15, 2) DEFAULT 0.00,
    net_profit DECIMAL(15, 2) DEFAULT 0.00,
    total_transactions INTEGER DEFAULT 0,
    report_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- System Logs table
CREATE TABLE public.system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action log_action NOT NULL,
    entity_type TEXT, -- 'user', 'game', 'transaction', 'wallet'
    entity_id UUID,
    description TEXT,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Operating Balance (system-wide financials)
CREATE TABLE public.operating_balance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total_deposits DECIMAL(15, 2) DEFAULT 0.00,
    total_withdrawals DECIMAL(15, 2) DEFAULT 0.00,
    total_bets DECIMAL(15, 2) DEFAULT 0.00,
    total_payouts DECIMAL(15, 2) DEFAULT 0.00,
    operating_profit DECIMAL(15, 2) DEFAULT 0.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_game_id ON public.transactions(game_id);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at);
CREATE INDEX idx_game_history_user_id ON public.game_history(user_id);
CREATE INDEX idx_game_history_game_id ON public.game_history(game_id);
CREATE INDEX idx_system_logs_created_at ON public.system_logs(created_at);

-- Disable RLS for this demo (no auth as per requirements)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operating_balance ENABLE ROW LEVEL SECURITY;

-- Public access policies (no auth required as per spec)
CREATE POLICY "Public read access" ON public.users FOR SELECT USING (true);
CREATE POLICY "Public write access" ON public.users FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read access" ON public.wallets FOR SELECT USING (true);
CREATE POLICY "Public write access" ON public.wallets FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read access" ON public.games FOR SELECT USING (true);
CREATE POLICY "Public write access" ON public.games FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read access" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Public write access" ON public.transactions FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read access" ON public.game_history FOR SELECT USING (true);
CREATE POLICY "Public write access" ON public.game_history FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read access" ON public.reports FOR SELECT USING (true);
CREATE POLICY "Public write access" ON public.reports FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read access" ON public.system_logs FOR SELECT USING (true);
CREATE POLICY "Public write access" ON public.system_logs FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read access" ON public.operating_balance FOR SELECT USING (true);
CREATE POLICY "Public write access" ON public.operating_balance FOR ALL USING (true) WITH CHECK (true);

-- Create update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON public.wallets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON public.games FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_operating_balance_updated_at BEFORE UPDATE ON public.operating_balance FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial operating balance record
INSERT INTO public.operating_balance (total_deposits, total_withdrawals, total_bets, total_payouts, operating_profit) 
VALUES (0.00, 0.00, 0.00, 0.00, 0.00);