import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useProjects,
  Project,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
  KANBAN_COLUMNS,
} from "@/hooks/useProjects";
import {
  Search,
  Loader2,
  Calendar,
  FileText,
  ImageIcon,
  Receipt,
  ArrowRight,
  FolderOpen,
} from "lucide-react";

const GestaoProjetosOverview = () => {
  const navigate = useNavigate();
  const { projects, loading } = useProjects();
  const [search, setSearch] = useState("");

  const filtered = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
  );

  const projectsByStatus = KANBAN_COLUMNS.reduce((acc, status) => {
    acc[status] = filtered.filter((p) => p.status === status);
    return acc;
  }, {} as Record<string, Project[]>);

  const stats = {
    total: projects.length,
    active: projects.filter((p) => !["concluido", "arquivado"].includes(p.status)).length,
    concluded: projects.filter((p) => p.status === "concluido").length,
    avgProgress: projects.length > 0 ? Math.round(projects.reduce((a, p) => a + p.progress, 0) / projects.length) : 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Projetos</h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe a execução, documentação e cronograma de cada projeto
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{stats.active}</p>
            <p className="text-xs text-muted-foreground">Ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-accent">{stats.concluded}</p>
            <p className="text-xs text-muted-foreground">Concluídos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.avgProgress}%</p>
            <p className="text-xs text-muted-foreground">Progresso Médio</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar projetos..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Tabs defaultValue="por-etapa">
          <TabsList>
            <TabsTrigger value="por-etapa">Por Etapa</TabsTrigger>
            <TabsTrigger value="todos">Todos os Projetos</TabsTrigger>
          </TabsList>

          <TabsContent value="por-etapa" className="space-y-6 mt-4">
            {KANBAN_COLUMNS.map((status) => {
              const statusProjects = projectsByStatus[status] || [];
              if (statusProjects.length === 0) return null;
              return (
                <div key={status}>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className={PROJECT_STATUS_COLORS[status]}>
                      {PROJECT_STATUS_LABELS[status]}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {statusProjects.length} projeto(s)
                    </span>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {statusProjects.map((project) => (
                      <Card
                        key={project.id}
                        className="cursor-pointer hover:shadow-md transition-all hover:border-primary/30 group"
                        onClick={() => navigate(`/gestao-projetos/${project.id}`)}
                      >
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <h3 className="font-semibold line-clamp-2 flex-1">{project.title}</h3>
                            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {project.description || project.briefing || "Sem descrição"}
                          </p>
                          <div className="flex items-center gap-2">
                            <Progress value={project.progress} className="h-1.5 flex-1" />
                            <span className="text-xs text-muted-foreground">{project.progress}%</span>
                          </div>
                          <div className="flex gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {project.start_date
                                ? new Date(project.start_date).toLocaleDateString("pt-BR")
                                : "Sem data"}
                            </span>
                            {project.budget > 0 && (
                              <span>
                                R$ {project.budget.toLocaleString("pt-BR")}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p className="font-medium">Nenhum projeto encontrado</p>
                <p className="text-sm mt-1">Crie projetos no Escritório de Projetos</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="todos" className="space-y-2 mt-4">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p className="font-medium">Nenhum projeto encontrado</p>
              </div>
            ) : (
              filtered.map((project) => (
                <Card
                  key={project.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/gestao-projetos/${project.id}`)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{project.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {project.description || project.briefing}
                      </p>
                    </div>
                    <Badge variant="outline" className={PROJECT_STATUS_COLORS[project.status]}>
                      {PROJECT_STATUS_LABELS[project.status]}
                    </Badge>
                    <div className="flex items-center gap-2 w-32 shrink-0">
                      <Progress value={project.progress} className="h-1.5 flex-1" />
                      <span className="text-xs text-muted-foreground">{project.progress}%</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default GestaoProjetosOverview;
