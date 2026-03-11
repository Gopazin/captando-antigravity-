import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, LayoutGrid, List, Search, Loader2 } from "lucide-react";
import { KanbanBoard } from "@/components/KanbanBoard";
import { ProjectDetail } from "@/components/ProjectDetail";
import {
  useProjects, Project, ProjectStatus, PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS, KANBAN_COLUMNS,
} from "@/hooks/useProjects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

const Projetos = () => {
  const navigate = useNavigate();
  const { projects, loading, updateProjectStatus, updateProject, createProject } = useProjects();
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [newProject, setNewProject] = useState({ title: "", description: "", status: "ideacao" as ProjectStatus });

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setDetailOpen(true);
  };

  const handleStatusChange = async (projectId: string, newStatus: ProjectStatus) => {
    await updateProjectStatus(projectId, newStatus);
  };

  const handleCreateProject = async () => {
    if (!newProject.title.trim()) return;
    const created = await createProject(newProject);
    if (created) {
      setNewProjectOpen(false);
      setNewProject({ title: "", description: "", status: "ideacao" });
      setSelectedProject(created);
      setDetailOpen(true);
    }
  };

  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: projects.length,
    active: projects.filter((p) => !["concluido", "arquivado"].includes(p.status)).length,
    concluded: projects.filter((p) => p.status === "concluido").length,
    avgProgress: projects.length > 0 ? Math.round(projects.reduce((a, p) => a + p.progress, 0) / projects.length) : 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Projetos</h1>
          <p className="text-muted-foreground mt-1">Gerencie seus projetos com visão Kanban e assistência por IA</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/assistente")}>
            Criar com IA
          </Button>
          <Dialog open={newProjectOpen} onOpenChange={setNewProjectOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Plus className="h-4 w-4 mr-2" /> Novo Projeto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Projeto</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Título *</Label>
                  <Input
                    value={newProject.title}
                    onChange={(e) => setNewProject((p) => ({ ...p, title: e.target.value }))}
                    placeholder="Nome do projeto"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Breve descrição do projeto"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fase Inicial</Label>
                  <Select
                    value={newProject.status}
                    onValueChange={(v) => setNewProject((p) => ({ ...p, status: v as ProjectStatus }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(PROJECT_STATUS_LABELS).filter(([k]) => k !== "arquivado").map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewProjectOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreateProject} disabled={!newProject.title.trim()}>Criar Projeto</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
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

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar projetos..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex border rounded-lg">
          <Button
            variant={viewMode === "kanban" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("kanban")}
            className="rounded-r-none"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="rounded-l-none"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : viewMode === "kanban" ? (
        <KanbanBoard
          projects={filtered}
          columns={KANBAN_COLUMNS}
          onProjectClick={handleProjectClick}
          onStatusChange={handleStatusChange}
        />
      ) : (
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="font-medium">Nenhum projeto encontrado</p>
              <p className="text-sm mt-1">Crie um novo projeto para começar</p>
            </div>
          ) : (
            filtered.map((project) => (
              <Card
                key={project.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleProjectClick(project)}
              >
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

      {/* Project Detail Sheet */}
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

export default Projetos;
