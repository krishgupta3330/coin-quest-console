import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSystemLogs, useUsers } from "@/hooks/useDatabase";
import { 
  Activity, 
  Search, 
  Filter,
  AlertCircle,
  CheckCircle,
  Info,
  XCircle,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const actionIcons = {
  create: CheckCircle,
  update: RefreshCw,
  delete: XCircle,
  login: Info,
  logout: Info,
  balance_change: AlertCircle,
  game_play: Activity,
};

const actionColors = {
  create: "text-success bg-success/10 border-success/30",
  update: "text-warning bg-warning/10 border-warning/30",
  delete: "text-destructive bg-destructive/10 border-destructive/30",
  login: "text-info bg-info/10 border-info/30",
  logout: "text-muted-foreground bg-muted/50",
  balance_change: "text-primary bg-primary/10 border-primary/30",
  game_play: "text-info bg-info/10 border-info/30",
};

export default function AdminLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterEntity, setFilterEntity] = useState<string>("all");
  
  const { data: logs, isLoading, refetch } = useSystemLogs(200);
  const { data: users } = useUsers();

  // Apply filters
  const filteredLogs = logs?.filter((log) => {
    const matchesSearch = 
      log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = filterAction === "all" || log.action === filterAction;
    const matchesEntity = filterEntity === "all" || log.entity_type === filterEntity;
    return matchesSearch && matchesAction && matchesEntity;
  });

  // Get unique entity types
  const entityTypes = [...new Set(logs?.map((l) => l.entity_type).filter(Boolean))] as string[];

  return (
    <DashboardLayout variant="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Activity className="h-8 w-8 text-primary" />
              System Logs
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor all system activities and changes
            </p>
          </div>
          <Button onClick={() => refetch()} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card className="glass">
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                  <SelectItem value="balance_change">Balance Change</SelectItem>
                  <SelectItem value="game_play">Game Play</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterEntity} onValueChange={setFilterEntity}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Entity Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  {entityTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Logs List */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Activity Logs ({filteredLogs?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isLoading ? (
                <div className="py-12 text-center text-muted-foreground">
                  Loading logs...
                </div>
              ) : filteredLogs?.length ? (
                filteredLogs.map((log) => {
                  const Icon = actionIcons[log.action] || Activity;
                  const colorClass = actionColors[log.action] || "text-muted-foreground bg-muted/50";
                  const user = users?.find((u) => u.id === log.user_id);

                  return (
                    <div
                      key={log.id}
                      className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className={`p-2 rounded-lg ${colorClass}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className={colorClass}>
                                {log.action.replace("_", " ")}
                              </Badge>
                              {log.entity_type && (
                                <Badge variant="secondary" className="text-xs">
                                  {log.entity_type}
                                </Badge>
                              )}
                              {user && (
                                <span className="text-sm text-muted-foreground">
                                  by <span className="font-medium">{user.username}</span>
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm">
                              {log.description || "No description available"}
                            </p>
                            {log.entity_id && (
                              <p className="mt-1 text-xs text-muted-foreground font-mono">
                                ID: {log.entity_id}
                              </p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(log.created_at), "MMM dd, yyyy")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(log.created_at), "HH:mm:ss")}
                            </p>
                            {log.ip_address && (
                              <p className="text-xs text-muted-foreground font-mono mt-1">
                                {log.ip_address}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  No logs found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
