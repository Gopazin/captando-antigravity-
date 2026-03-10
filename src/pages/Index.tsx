import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FolderKanban, FileText, Clock, TrendingUp, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS, type Project } from "@/hooks/useProjects";

const Index = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [grants, setGrants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [projRes, grantRes] = await Promise.all([
        supabase.from("projects").select("*").neq("status", "arquivado").order("updated_at", { ascending: false }).limit(5),
        supabase.from("grants").select("*").eq("is_active", true).order("deadline", { ascending: true }).limit(5),
      ]);
      setProjects((projRes.data as unknown as Project[]) || []);
      setGrants(grantRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const activeProjects = projects.filter((p) => !["concluido", "arquivado"].includes(p.status));
  const upcomingGrants = grants.filter((g) => g.deadline && new Date(g.deadline) > new Date());

  const stats = [
    { label: "Projetos Ativos", value: activeProjects.length, icon: FolderKanban, color: "text-primary" },
    { label: "Editais Disponíveis", value: grants.length, icon: FileText, color: "text-accent" },
    { label: "Prazos Próximos", value: upcomingGrants.length, icon: Clock, color: "text-warning" },
    { label: "Concluídos", value: projects.filter((p) => p.status === "concluido").length, icon: TrendingUp, color: "text-accent" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral dos seus projetos e editais</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color} opacity-80`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Projetos Recentes</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/projetos")}>
              Ver todos <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum projeto ainda</p>
            ) : (
              projects.slice(0, 5).map((project) => (
                <div key={project.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate("/projetos")}>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{project.title}</p>
                    <p className="text-sm text-muted-foreground">Atualizado em {new Date(project.updated_at).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <Badge variant="outline" className={PROJECT_STATUS_COLORS[project.status]}>
                    {PROJECT_STATUS_LABELS[project.status]}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Prazos Próximos</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/editais")}>
              Ver editais <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingGrants.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum prazo próximo</p>
            ) : (
              upcomingGrants.map((grant) => {
                const daysLeft = Math.ceil((new Date(grant.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={grant.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate("/editais")}>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{grant.title}</p>
                      <p className="text-sm text-muted-foreground">{grant.organization}</p>
                    </div>
                    <Badge variant="outline" className={daysLeft <= 15 ? "bg-destructive/15 text-destructive border-destructive/30" : "bg-accent/15 text-accent border-accent/30"}>
                      {daysLeft}d restantes
                    </Badge>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
