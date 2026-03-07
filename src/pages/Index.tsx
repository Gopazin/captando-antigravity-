import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FolderKanban, FileText, Clock, TrendingUp, ArrowRight } from "lucide-react";
import { mockProjects, mockGrants } from "@/data/mock";
import { STATUS_LABELS, AREA_LABELS } from "@/types";
import { useNavigate } from "react-router-dom";

const statusColors: Record<string, string> = {
  rascunho: "bg-muted text-muted-foreground",
  em_revisao: "bg-warning/15 text-warning border-warning/30",
  finalizado: "bg-accent/15 text-accent border-accent/30",
};

const Index = () => {
  const navigate = useNavigate();
  const activeProjects = mockProjects.filter((p) => p.status !== "finalizado");
  const upcomingGrants = mockGrants
    .filter((g) => new Date(g.deadline) > new Date())
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 3);

  const stats = [
    { label: "Projetos Ativos", value: activeProjects.length, icon: FolderKanban, color: "text-primary" },
    { label: "Editais Disponíveis", value: mockGrants.length, icon: FileText, color: "text-accent" },
    { label: "Prazos Próximos", value: upcomingGrants.length, icon: Clock, color: "text-warning" },
    { label: "Finalizados", value: mockProjects.filter((p) => p.status === "finalizado").length, icon: TrendingUp, color: "text-accent" },
  ];

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
            {mockProjects.map((project) => (
              <div key={project.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                <div className="min-w-0">
                  <p className="font-medium truncate">{project.title}</p>
                  <p className="text-sm text-muted-foreground">Atualizado em {new Date(project.updatedAt).toLocaleDateString("pt-BR")}</p>
                </div>
                <Badge variant="outline" className={statusColors[project.status]}>
                  {STATUS_LABELS[project.status]}
                </Badge>
              </div>
            ))}
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
            {upcomingGrants.map((grant) => {
              const daysLeft = Math.ceil((new Date(grant.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              return (
                <div key={grant.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{grant.title}</p>
                    <p className="text-sm text-muted-foreground">{AREA_LABELS[grant.area]} · R$ {grant.maxValue.toLocaleString("pt-BR")}</p>
                  </div>
                  <Badge variant="outline" className={daysLeft <= 15 ? "bg-destructive/15 text-destructive border-destructive/30" : "bg-accent/15 text-accent border-accent/30"}>
                    {daysLeft}d restantes
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
