import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, LayoutGrid, List, Search, Loader2 } from "lucide-react";
import { KanbanBoard } from "@/components/KanbanBoard";
import { ProjectDetail } from "@/components/ProjectDetail";
import {
  useProjects, Project, ProjectStatus, PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS,
} from "@/hooks/useProjects";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const EscritorioKanban = () => {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kanban de Projetos</h1>
          <p className="text-muted-foreground mt-1">Visualize e mova projetos entre as fases</p>
        </div>
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
                  placeholder="Breve descrição"
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
              <Button onClick={handleCreateProject} disabled={!newProject.title.trim()}>Criar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
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
        <KanbanBoard projects={filtered} onProjectClick={handleProjectClick} onStatusChange={handleStatusChange} />
      ) : (
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="font-medium">Nenhum projeto encontrado</p>
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
