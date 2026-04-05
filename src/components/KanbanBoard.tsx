import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Project, ProjectStatus, PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS,
} from "@/hooks/useProjects";
import { useProjectHealthScores } from "@/hooks/useProjectHealthScores";
import { GripVertical, Clock, Sparkles, Brain } from "lucide-react";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface KanbanBoardProps {
  projects: Project[];
  columns: ProjectStatus[];
  onProjectClick: (project: Project) => void;
  onStatusChange: (projectId: string, newStatus: ProjectStatus) => void;
}

function HealthScoreBadge({ score }: { score: number | null }) {
  if (score === null) return null;

  const color =
    score >= 8 ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
    score >= 5 ? "bg-amber-100 text-amber-700 border-amber-200" :
    "bg-red-100 text-red-700 border-red-200";

  const label =
    score >= 8 ? "Forte" :
    score >= 5 ? "Regular" :
    "Fraco";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold ${color} cursor-default`}>
            <Brain className="h-2.5 w-2.5" />
            {score}/10
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <p className="font-medium">Score de IA: {label}</p>
          <p className="text-muted-foreground">Média das 3 camadas de pré-avaliação</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

const domainColors: Record<string, string> = {
  cultura: "bg-purple-100 text-purple-700",
  esporte: "bg-blue-100 text-blue-700",
  social: "bg-rose-100 text-rose-700",
  educacao: "bg-amber-100 text-amber-700",
  saude: "bg-green-100 text-green-700",
  meio_ambiente: "bg-teal-100 text-teal-700",
  tecnologia: "bg-indigo-100 text-indigo-700",
  infraestrutura: "bg-slate-100 text-slate-700",
  emenda: "bg-orange-100 text-orange-700",
};

export function KanbanBoard({ projects, columns, onProjectClick, onStatusChange }: KanbanBoardProps) {
  const [draggedProject, setDraggedProject] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ProjectStatus | null>(null);

  const projectIds = projects.map(p => p.id);
  const { scores } = useProjectHealthScores(projectIds);

  const handleDragStart = (e: React.DragEvent, projectId: string) => {
    setDraggedProject(projectId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, status: ProjectStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(status);
  };

  const handleDragLeave = () => setDragOverColumn(null);

  const handleDrop = (e: React.DragEvent, status: ProjectStatus) => {
    e.preventDefault();
    if (draggedProject) {
      onStatusChange(draggedProject, status);
    }
    setDraggedProject(null);
    setDragOverColumn(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[60vh]">
      {columns.map((status) => {
        const columnProjects = projects.filter((p) => p.status === status);
        const isOver = dragOverColumn === status;

        return (
          <div
            key={status}
            className={`flex-shrink-0 w-72 rounded-xl transition-colors ${
              isOver ? "bg-accent/10 ring-2 ring-accent/30" : "bg-muted/30"
            }`}
            onDragOver={(e) => handleDragOver(e, status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={PROJECT_STATUS_COLORS[status]}>
                  {PROJECT_STATUS_LABELS[status]}
                </Badge>
                <span className="text-xs text-muted-foreground font-medium">{columnProjects.length}</span>
              </div>
            </div>

            <div className="px-2 pb-3 space-y-2 min-h-[200px]">
              {columnProjects.map((project) => {
                const health = scores[project.id];
                const avgScore = health?.avgScore ?? null;

                return (
                  <Card
                    key={project.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, project.id)}
                    className={`cursor-grab active:cursor-grabbing hover:shadow-md transition-all group ${
                      draggedProject === project.id ? "opacity-50 scale-95" : ""
                    }`}
                    onClick={() => onProjectClick(project)}
                  >
                    <CardHeader className="p-3 pb-1">
                      <div className="flex items-start gap-1">
                        <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0 opacity-40" />
                        <p className="text-sm font-medium leading-tight line-clamp-2 flex-1">{project.title}</p>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-1 space-y-2">
                      {project.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{project.description || project.briefing}</p>
                      )}

                      {/* Domain + Type badges */}
                      <div className="flex flex-wrap gap-1">
                        {project.domain && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${domainColors[project.domain] || "bg-muted text-muted-foreground"}`}>
                            {project.domain}
                          </span>
                        )}
                        {project.project_type === "emenda" && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-orange-100 text-orange-700">
                            Emenda
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <Progress value={project.progress} className="h-1.5 flex-1" />
                          <span className="text-xs text-muted-foreground">{project.progress}%</span>
                        </div>
                        <HealthScoreBadge score={avgScore} />
                      </div>

                      {/* Score breakdown on hover */}
                      {health && (health.conformidade !== null || health.merito !== null || health.alinhamento !== null) && (
                        <div className="hidden group-hover:flex gap-1 pt-1 border-t border-muted/50">
                          {[
                            { label: "C", value: health.conformidade, title: "Conformidade" },
                            { label: "M", value: health.merito, title: "Mérito" },
                            { label: "A", value: health.alinhamento, title: "Alinhamento" },
                          ].map(({ label, value, title }) => (
                            <div key={label} title={title} className="flex-1 text-center">
                              <p className="text-[9px] text-muted-foreground">{label}</p>
                              <p className={`text-[11px] font-bold ${value !== null && value >= 7 ? "text-emerald-600" : value !== null && value >= 5 ? "text-amber-600" : "text-muted-foreground"}`}>
                                {value !== null ? value : "—"}
                              </p>
                            </div>
                          ))}
                          <div className="flex items-center ml-1">
                            <Sparkles className="h-3 w-3 text-accent" />
                          </div>
                        </div>
                      )}

                      {project.end_date && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(project.end_date).toLocaleDateString("pt-BR")}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}

              {columnProjects.length === 0 && (
                <div className="flex items-center justify-center h-24 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                  <p className="text-xs text-muted-foreground">Arraste projetos aqui</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
