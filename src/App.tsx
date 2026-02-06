import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// User Panel
import UserDashboard from "./pages/user/UserDashboard";
import UserWallet from "./pages/user/UserWallet";
import UserGames from "./pages/user/UserGames";
import UserHistory from "./pages/user/UserHistory";

// Admin Panel
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminGames from "./pages/admin/AdminGames";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminReports from "./pages/admin/AdminReports";
import AdminLogs from "./pages/admin/AdminLogs";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* User Panel Routes */}
          <Route path="/user" element={<UserDashboard />} />
          <Route path="/user/wallet" element={<UserWallet />} />
          <Route path="/user/games" element={<UserGames />} />
          <Route path="/user/history" element={<UserHistory />} />
          
          {/* Admin Panel Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/games" element={<AdminGames />} />
          <Route path="/admin/transactions" element={<AdminTransactions />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/logs" element={<AdminLogs />} />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
