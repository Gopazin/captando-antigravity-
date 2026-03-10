import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  FolderKanban, FileText, Clock, TrendingUp, ArrowRight, Loader2,
  DollarSign, AlertTriangle, Radar, ShieldCheck, Sparkles,
} from "lucide-react";
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
        supabase.from("grants").select("*").eq("is_active", true).order("deadline", { ascending: true }).limit(10),
      ]);
      setProjects((projRes.data as unknown as Project[]) || []);
      setGrants(grantRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const activeProjects = projects.filter((p) => !["concluido", "arquivado"].includes(p.status));
  const upcomingGrants = grants.filter((g) => g.deadline && new Date(g.deadline) > new Date());
  const totalBudget = projects.reduce((a, p) => a + (p.budget || 0), 0);

  const stats = [
    { label: "Projetos Ativos", value: activeProjects.length, icon: FolderKanban, color: "text-accent", bg: "bg-accent/10" },
    { label: "Editais no Radar", value: grants.length, icon: Radar, color: "text-primary", bg: "bg-primary/10" },
    { label: "Prazos Próximos", value: upcomingGrants.filter((g) => {
      const d = Math.ceil((new Date(g.deadline).getTime() - Date.now()) / 86400000);
      return d <= 30 && d > 0;
    }).length, icon: Clock, color: "text-warning", bg: "bg-warning/10" },
    { label: "Recursos Captados", value: `R$ ${(totalBudget / 1000).toFixed(0)}k`, icon: DollarSign, color: "text-accent", bg: "bg-accent/10" },
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
        <p className="text-muted-foreground mt-1">Visão geral de recursos captados, editais e gestão</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="hover:shadow-md transition-shadow border-l-4 border-l-transparent hover:border-l-accent">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts banner */}
      {upcomingGrants.length > 0 && (
        <Card className="border-accent/30 bg-accent/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <AlertTriangle className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Alertas de Editais Relevantes</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {upcomingGrants.length} edital(is) com prazo nos próximos 30 dias baseados no seu perfil
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/editais")}>
              Ver Editais <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-accent" />
              Projetos Recentes
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/projetos")}>
              Ver todos <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {projects.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">Nenhum projeto ainda</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate("/assistente")}>
                  <Sparkles className="h-4 w-4 mr-1" /> Criar com IA
                </Button>
              </div>
            ) : (
              projects.slice(0, 4).map((project) => (
                <div key={project.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate("/projetos")}>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{project.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={project.progress} className="h-1 w-16" />
                      <span className="text-xs text-muted-foreground">{project.progress}%</span>
                    </div>
                  </div>
                  <Badge variant="outline" className={`${PROJECT_STATUS_COLORS[project.status]} text-xs`}>
                    {PROJECT_STATUS_LABELS[project.status]}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Grants */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Radar className="h-5 w-5 text-primary" />
              Editais no Radar
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/editais")}>
              Ver todos <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {grants.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">Nenhum edital encontrado</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate("/editais")}>
                  <Radar className="h-4 w-4 mr-1" /> Buscar Editais
                </Button>
              </div>
            ) : (
              grants.slice(0, 4).map((grant) => {
                const daysLeft = grant.deadline ? Math.ceil((new Date(grant.deadline).getTime() - Date.now()) / 86400000) : null;
                return (
                  <div key={grant.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate("/editais")}>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{grant.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{grant.organization}</p>
                    </div>
                    {daysLeft !== null && daysLeft > 0 ? (
                      <Badge variant="outline" className={`text-xs ${daysLeft <= 15 ? "text-destructive border-destructive/30" : "text-accent border-accent/30"}`}>
                        {daysLeft}d
                      </Badge>
                    ) : daysLeft !== null ? (
                      <Badge variant="secondary" className="text-xs">Encerrado</Badge>
                    ) : null}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow hover:border-accent/30" onClick={() => navigate("/assistente")}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10"><Sparkles className="h-5 w-5 text-accent" /></div>
            <div>
              <p className="text-sm font-medium">Criar Projeto com IA</p>
              <p className="text-xs text-muted-foreground">Gere projetos estruturados automaticamente</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow hover:border-accent/30" onClick={() => navigate("/cofre")}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><ShieldCheck className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-sm font-medium">Atualizar Cofre</p>
              <p className="text-xs text-muted-foreground">Mantenha o DNA da organização atualizado</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow hover:border-accent/30" onClick={() => navigate("/gestao")}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><FileText className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-sm font-medium">Gestão & Compliance</p>
              <p className="text-xs text-muted-foreground">Rubricas e prestação de contas</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;