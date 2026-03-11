import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, List, Search, Loader2, Star, Plus, Calendar, DollarSign, ArrowRight } from "lucide-react";
import { KanbanBoard } from "@/components/KanbanBoard";
import { ProjectDetail } from "@/components/ProjectDetail";
import {
  useProjects, Project, ProjectStatus, PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS, ESCRITORIO_COLUMNS,
} from "@/hooks/useProjects";
import { useSelectedGrants } from "@/hooks/useSelectedGrants";
import { AREA_LABELS, GrantArea } from "@/types";
import { toast } from "sonner";

const areaColors: Record<string, string> = {
  cultura: "bg-purple-100 text-purple-700 border-purple-200",
  esporte: "bg-blue-100 text-blue-700 border-blue-200",
  social: "bg-rose-100 text-rose-700 border-rose-200",
  educacao: "bg-amber-100 text-amber-700 border-amber-200",
  saude: "bg-green-100 text-green-700 border-green-200",
  meio_ambiente: "bg-teal-100 text-teal-700 border-teal-200",
  tecnologia: "bg-indigo-100 text-indigo-700 border-indigo-200",
};

const EscritorioKanban = () => {
  const { projects, loading, updateProjectStatus, updateProject, createProject } = useProjects();
  const { grants: selectedGrants, loading: grantsLoading } = useSelectedGrants();
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [creatingFromGrant, setCreatingFromGrant] = useState<string | null>(null);

  // Filter projects to escritório phases only
  const escritorioProjects = projects.filter((p) =>
    ESCRITORIO_COLUMNS.includes(p.status)
  );

  const filtered = escritorioProjects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setDetailOpen(true);
  };

  const handleStatusChange = async (projectId: string, newStatus: ProjectStatus) => {
    await updateProjectStatus(projectId, newStatus);
  };

  const handleCreateFromGrant = async (grant: { id: string; title: string; organization: string }) => {
    setCreatingFromGrant(grant.id);
    const created = await createProject({
      title: `Projeto - ${grant.title}`,
      description: `Projeto elaborado para o edital "${grant.title}" da ${grant.organization}`,
      grant_id: grant.id,
      status: "elaboracao" as ProjectStatus,
    });
    if (created) {
      toast.success("Projeto criado! Movido para a aba Kanban.");
      setSelectedProject(created);
      setDetailOpen(true);
    }
    setCreatingFromGrant(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Escritório de Projetos</h1>
        <p className="text-muted-foreground mt-1">Da seleção de editais à submissão de projetos</p>
      </div>

      <Tabs defaultValue="editais-selecionados" className="space-y-4">
        <TabsList>
          <TabsTrigger value="editais-selecionados">
            <Star className="h-4 w-4 mr-2" />
            Editais Selecionados
            {selectedGrants.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs h-5 px-1.5">{selectedGrants.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="kanban">
            <LayoutGrid className="h-4 w-4 mr-2" />
            Kanban de Elaboração
            {escritorioProjects.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs h-5 px-1.5">{escritorioProjects.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab: Editais Selecionados */}
        <TabsContent value="editais-selecionados" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Editais marcados como interesse no Radar. Crie projetos a partir deles.
          </p>

          {grantsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : selectedGrants.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Star className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Nenhum edital selecionado</p>
              <p className="text-sm mt-1">Vá ao <strong>Banco de Editais</strong> e marque editais com a estrela ★ para vê-los aqui.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {selectedGrants.map((grant) => {
                const existingProject = projects.find((p) => p.grant_id === grant.id);
                return (
                  <Card key={grant.id} className="hover:shadow-md transition-all">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm line-clamp-2">{grant.title}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">{grant.organization}</p>
                        </div>
                        <Badge variant="outline" className={`shrink-0 ml-2 text-xs ${areaColors[grant.area] || ""}`}>
                          {AREA_LABELS[grant.area as GrantArea] || grant.area}
                        </Badge>
                      </div>

                      <div className="flex gap-3 text-xs text-muted-foreground">
                        {grant.max_value > 0 && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            R$ {Number(grant.max_value).toLocaleString("pt-BR")}
                          </span>
                        )}
                        {grant.deadline && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(grant.deadline).toLocaleDateString("pt-BR")}
                          </span>
                        )}
                      </div>

                      {existingProject ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleProjectClick(existingProject)}
                        >
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Ver Projeto ({PROJECT_STATUS_LABELS[existingProject.status]})
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => handleCreateFromGrant(grant)}
                          disabled={creatingFromGrant === grant.id}
                        >
                          {creatingFromGrant === grant.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Plus className="h-4 w-4 mr-2" />
                          )}
                          Criar Projeto
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Tab: Kanban de Elaboração */}
        <TabsContent value="kanban" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar projetos..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="flex border rounded-lg">
              <Button variant={viewMode === "kanban" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("kanban")} className="rounded-r-none">
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("list")} className="rounded-l-none">
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : viewMode === "kanban" ? (
            <KanbanBoard
              projects={filtered}
              columns={ESCRITORIO_COLUMNS}
              onProjectClick={handleProjectClick}
              onStatusChange={handleStatusChange}
            />
          ) : (
            <div className="space-y-2">
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="font-medium">Nenhum projeto em elaboração</p>
                  <p className="text-sm mt-1">Crie projetos a partir dos editais selecionados</p>
                </div>
              ) : (
                filtered.map((project) => (
                  <Card key={project.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleProjectClick(project)}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{project.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">{project.description || project.briefing}</p>
                      </div>
                      <Badge variant="outline" className={PROJECT_STATUS_COLORS[project.status]}>
                        {PROJECT_STATUS_LABELS[project.status]}
                      </Badge>
                      <div className="flex items-center gap-2 w-32 shrink-0">
                        <Progress value={project.progress} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted-foreground">{project.progress}%</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ProjectDetail
        project={selectedProject}
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setSelectedProject(null); }}
        onUpdate={updateProject}
        onStatusChange={updateProjectStatus}
      />
    </div>
  );
};

export default EscritorioKanban;
