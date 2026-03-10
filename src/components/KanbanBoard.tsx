import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Project, ProjectStatus, PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS, KANBAN_COLUMNS,
} from "@/hooks/useProjects";
import { GripVertical, ArrowRight, Clock } from "lucide-react";
import { useState } from "react";

interface KanbanBoardProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
  onStatusChange: (projectId: string, newStatus: ProjectStatus) => void;
}

export function KanbanBoard({ projects, onProjectClick, onStatusChange }: KanbanBoardProps) {
  const [draggedProject, setDraggedProject] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ProjectStatus | null>(null);

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
      {KANBAN_COLUMNS.map((status) => {
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
              {columnProjects.map((project) => (
                <Card
                  key={project.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, project.id)}
                  className={`cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${
                    draggedProject === project.id ? "opacity-50 scale-95" : ""
                  }`}
                  onClick={() => onProjectClick(project)}
                >
                  <CardHeader className="p-3 pb-1">
                    <div className="flex items-start gap-1">
                      <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0 opacity-40" />
                      <p className="text-sm font-medium leading-tight line-clamp-2">{project.title}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-1 space-y-2">
                    {project.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{project.description || project.briefing}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <Progress value={project.progress} className="h-1.5 flex-1" />
                      <span className="text-xs text-muted-foreground">{project.progress}%</span>
                    </div>
                    {project.end_date && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(project.end_date).toLocaleDateString("pt-BR")}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

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
