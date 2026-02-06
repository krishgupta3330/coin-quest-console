import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Shield, 
  ArrowRight, 
  LayoutDashboard, 
  Gamepad2, 
  BarChart3,
  Users,
  Wallet,
  Activity
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-info/10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-info/20 rounded-full blur-3xl animate-pulse-slow" />
        
        <div className="relative container mx-auto px-6 py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-medium text-primary mb-8">
              <Sparkles className="h-4 w-4" />
              Game Data Management System
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              <span className="gradient-text">Complete Gaming</span>
              <br />
              <span className="text-foreground">Management Platform</span>
            </h1>

            {/* Description */}
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
              A scalable, production-ready application for game data management, 
              balance operations, transaction history, and financial reporting. 
              Separate User and Admin panels with comprehensive dashboards.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/user">
                <Button size="lg" className="gap-2 glow min-w-[200px]">
                  <Sparkles className="h-5 w-5" />
                  User Panel
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/admin">
                <Button size="lg" variant="outline" className="gap-2 min-w-[200px]">
                  <Shield className="h-5 w-5" />
                  Admin Panel
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Two Powerful Interfaces</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Designed for both end-users and administrators with role-specific features
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* User Panel Card */}
          <div className="glass rounded-2xl p-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-6">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4">User Panel</h3>
              <p className="text-muted-foreground mb-6">
                Complete user dashboard with wallet management, game participation, 
                and transaction history tracking.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  { icon: LayoutDashboard, text: "Personal Dashboard" },
                  { icon: Wallet, text: "Balance & Wallet Management" },
                  { icon: Gamepad2, text: "Game Participation" },
                  { icon: Activity, text: "Win/Loss Tracking" },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <item.icon className="h-4 w-4 text-primary" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
              <Link to="/user">
                <Button className="gap-2">
                  Open User Panel
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Admin Panel Card */}
          <div className="glass rounded-2xl p-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-info/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-info/10 text-info mb-6">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Admin Panel</h3>
              <p className="text-muted-foreground mb-6">
                Comprehensive administration with user management, game configuration, 
                and detailed financial reporting.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  { icon: Users, text: "User Data Management" },
                  { icon: Gamepad2, text: "Game Configuration" },
                  { icon: BarChart3, text: "Financial Reports" },
                  { icon: Activity, text: "System Activity Logs" },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <item.icon className="h-4 w-4 text-info" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
              <Link to="/admin">
                <Button variant="secondary" className="gap-2">
                  Open Admin Panel
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>Game Data Management System • Demo Application</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
