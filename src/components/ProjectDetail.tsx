import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Project, ProjectTask, ProjectNote, ProjectStatus, TaskStatus, TaskPriority,
  PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS, TASK_PRIORITY_COLORS,
  useProjectTasks, useProjectNotes,
} from "@/hooks/useProjects";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ListTodo, MessageSquare, BarChart3, Sparkles, Plus, Trash2, Loader2,
  CheckCircle2, Circle, Clock, AlertTriangle, Bot, Send,
} from "lucide-react";

interface ProjectDetailProps {
  project: Project | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Project>) => Promise<boolean>;
  onStatusChange: (id: string, status: ProjectStatus) => Promise<boolean>;
}

const taskStatusIcons: Record<TaskStatus, typeof Circle> = {
  pendente: Circle,
  em_andamento: Clock,
  concluida: CheckCircle2,
  bloqueada: AlertTriangle,
};

export function ProjectDetail({ project, open, onClose, onUpdate, onStatusChange }: ProjectDetailProps) {
  const { tasks, addTask, updateTask, deleteTask } = useProjectTasks(project?.id || null);
  const { notes, addNote } = useProjectNotes(project?.id || null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("media");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [noteInput, setNoteInput] = useState("");

  if (!project) return null;

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    await addTask({ title: newTaskTitle, priority: newTaskPriority, sort_order: tasks.length });
    setNewTaskTitle("");
  };

  const handleTaskStatusToggle = async (task: ProjectTask) => {
    const nextStatus: Record<TaskStatus, TaskStatus> = {
      pendente: "em_andamento",
      em_andamento: "concluida",
      concluida: "pendente",
      bloqueada: "pendente",
    };
    await updateTask(task.id, { status: nextStatus[task.status] });
  };

  const handleAiAction = async (action: string) => {
    setIsAiLoading(true);
    setAiResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("project-ai-assist", {
        body: { project, tasks, action },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setAiResult({ action, ...data });

      if (action === "suggest_tasks" && data.tasks) {
        toast.success(`${data.tasks.length} tarefas sugeridas pela IA!`);
      } else if (data.summary) {
        toast.success("Análise gerada pela IA!");
      }
    } catch (err) {
      console.error("AI assist error:", err);
      toast.error("Erro ao consultar IA.");
    }
    setIsAiLoading(false);
  };

  const handleApplySuggestedTasks = async () => {
    if (!aiResult?.tasks) return;
    for (const t of aiResult.tasks) {
      await addTask({
        title: t.title,
        description: t.description,
        priority: t.priority,
        due_date: t.due_days ? new Date(Date.now() + t.due_days * 86400000).toISOString().split("T")[0] : null,
        sort_order: tasks.length,
      });
    }
    setAiResult(null);
    toast.success("Tarefas adicionadas com sucesso!");
  };

  const handleAddNote = async () => {
    if (!noteInput.trim()) return;
    await addNote(noteInput);
    setNoteInput("");
  };

  const completedTasks = tasks.filter((t) => t.status === "concluida").length;
  const taskProgress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="sm:max-w-2xl w-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl">{project.title}</SheetTitle>
          <SheetDescription className="flex items-center gap-2">
            <Badge variant="outline" className={PROJECT_STATUS_COLORS[project.status]}>
              {PROJECT_STATUS_LABELS[project.status]}
            </Badge>
            <span className="text-xs">Progresso: {project.progress}%</span>
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {/* Quick status change */}
          <div className="flex items-center gap-2 flex-wrap">
            <Label className="text-xs text-muted-foreground">Mover para:</Label>
            {(["ideacao", "elaboracao", "revisao", "submissao", "aprovado", "em_execucao", "concluido"] as ProjectStatus[])
              .filter((s) => s !== project.status)
              .map((s) => (
                <Button
                  key={s}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => onStatusChange(project.id, s)}
                >
                  {PROJECT_STATUS_LABELS[s]}
                </Button>
              ))}
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progresso do projeto</span>
              <span>{taskProgress}% ({completedTasks}/{tasks.length} tarefas)</span>
            </div>
            <Progress value={taskProgress} className="h-2" />
          </div>

          <Tabs defaultValue="tasks" className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="tasks"><ListTodo className="h-4 w-4 mr-1" /> Tarefas</TabsTrigger>
              <TabsTrigger value="ai"><Sparkles className="h-4 w-4 mr-1" /> IA</TabsTrigger>
              <TabsTrigger value="notes"><MessageSquare className="h-4 w-4 mr-1" /> Notas</TabsTrigger>
              <TabsTrigger value="details"><BarChart3 className="h-4 w-4 mr-1" /> Detalhes</TabsTrigger>
            </TabsList>

            {/* Tasks Tab */}
            <TabsContent value="tasks" className="space-y-3 mt-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Nova tarefa..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                  className="flex-1"
                />
                <Select value={newTaskPriority} onValueChange={(v) => setNewTaskPriority(v as TaskPriority)}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="icon" onClick={handleAddTask}><Plus className="h-4 w-4" /></Button>
              </div>

              <div className="space-y-1.5 max-h-[50vh] overflow-y-auto">
                {tasks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <ListTodo className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Nenhuma tarefa ainda</p>
                    <p className="text-xs">Adicione manualmente ou peça sugestões à IA</p>
                  </div>
                )}
                {tasks.map((task) => {
                  const StatusIcon = taskStatusIcons[task.status];
                  return (
                    <div
                      key={task.id}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border transition-colors hover:bg-muted/50 ${
                        task.status === "concluida" ? "opacity-60" : ""
                      }`}
                    >
                      <button onClick={() => handleTaskStatusToggle(task)} className="shrink-0">
                        <StatusIcon className={`h-4 w-4 ${
                          task.status === "concluida" ? "text-accent" :
                          task.status === "bloqueada" ? "text-destructive" :
                          task.status === "em_andamento" ? "text-warning" : "text-muted-foreground"
                        }`} />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${task.status === "concluida" ? "line-through" : ""}`}>{task.title}</p>
                        {task.description && <p className="text-xs text-muted-foreground line-clamp-1">{task.description}</p>}
                      </div>
                      <Badge variant="secondary" className={`text-xs shrink-0 ${TASK_PRIORITY_COLORS[task.priority]}`}>
                        {task.priority}
                      </Badge>
                      {task.due_date && (
                        <span className="text-xs text-muted-foreground shrink-0">
                          {new Date(task.due_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                        </span>
                      )}
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => deleteTask(task.id)}>
                        <Trash2 className="h-3 w-3 text-muted-foreground" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {/* AI Tab */}
            <TabsContent value="ai" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="outline"
                  className="justify-start h-auto py-3 px-4"
                  onClick={() => handleAiAction("suggest_tasks")}
                  disabled={isAiLoading}
                >
                  <Sparkles className="h-4 w-4 mr-3 text-accent" />
                  <div className="text-left">
                    <p className="text-sm font-medium">Sugerir Tarefas</p>
                    <p className="text-xs text-muted-foreground">IA sugere tarefas para a fase atual</p>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start h-auto py-3 px-4"
                  onClick={() => handleAiAction("analyze_progress")}
                  disabled={isAiLoading}
                >
                  <BarChart3 className="h-4 w-4 mr-3 text-primary" />
                  <div className="text-left">
                    <p className="text-sm font-medium">Analisar Progresso</p>
                    <p className="text-xs text-muted-foreground">Receba recomendações estratégicas</p>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start h-auto py-3 px-4"
                  onClick={() => handleAiAction("next_steps")}
                  disabled={isAiLoading}
                >
                  <Bot className="h-4 w-4 mr-3 text-purple-500" />
                  <div className="text-left">
                    <p className="text-sm font-medium">Próximos Passos</p>
                    <p className="text-xs text-muted-foreground">Identifique ações críticas</p>
                  </div>
                </Button>
              </div>

              {isAiLoading && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-accent mr-2" />
                  <span className="text-sm text-muted-foreground">IA analisando...</span>
                </div>
              )}

              {aiResult && !isAiLoading && (
                <Card className="border-accent/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-accent" />
                      Resultado da IA
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {aiResult.action === "suggest_tasks" && aiResult.tasks && (
                      <>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                          {aiResult.tasks.map((t: any, i: number) => (
                            <div key={i} className="flex items-start gap-2 p-2 rounded bg-muted/50">
                              <Circle className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                              <div>
                                <p className="text-sm font-medium">{t.title}</p>
                                <p className="text-xs text-muted-foreground">{t.description}</p>
                              </div>
                              <Badge variant="secondary" className={`text-xs shrink-0 ${TASK_PRIORITY_COLORS[t.priority as TaskPriority] || ""}`}>
                                {t.priority}
                              </Badge>
                            </div>
                          ))}
                        </div>
                        <Button className="w-full" size="sm" onClick={handleApplySuggestedTasks}>
                          <Plus className="h-4 w-4 mr-1" /> Adicionar todas as tarefas
                        </Button>
                      </>
                    )}

                    {aiResult.summary && (
                      <div className="space-y-2">
                        <p className="text-sm">{aiResult.summary}</p>
                        {aiResult.recommendations?.map((r: any, i: number) => (
                          <div key={i} className={`flex items-start gap-2 p-2 rounded text-sm ${
                            r.priority === "critical" ? "bg-destructive/10 text-destructive" :
                            r.priority === "warning" ? "bg-warning/10 text-warning" : "bg-muted/50"
                          }`}>
                            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                            <span>{r.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="space-y-3 mt-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Adicionar nota..."
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                  className="flex-1"
                />
                <Button size="icon" onClick={handleAddNote}><Send className="h-4 w-4" /></Button>
              </div>
              <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                {notes.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">Nenhuma nota ainda</p>
                )}
                {notes.map((note) => (
                  <div key={note.id} className="p-2.5 rounded-lg border text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        {note.note_type === "ai_suggestion" ? "IA" :
                         note.note_type === "status_change" ? "Status" :
                         note.note_type === "system" ? "Sistema" : "Manual"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(note.created_at).toLocaleString("pt-BR")}
                      </span>
                    </div>
                    <p>{note.content}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Orçamento (R$)</Label>
                  <Input
                    type="number"
                    value={project.budget || ""}
                    onChange={(e) => onUpdate(project.id, { budget: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Progresso (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={project.progress}
                    onChange={(e) => onUpdate(project.id, { progress: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Data Início</Label>
                  <Input
                    type="date"
                    value={project.start_date || ""}
                    onChange={(e) => onUpdate(project.id, { start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Data Fim</Label>
                  <Input
                    type="date"
                    value={project.end_date || ""}
                    onChange={(e) => onUpdate(project.id, { end_date: e.target.value })}
                  />
                </div>
              </div>
              {project.briefing && (
                <div className="space-y-1">
                  <Label className="text-xs">Briefing</Label>
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">{project.briefing}</p>
                </div>
              )}
              {project.objectives && (
                <div className="space-y-1">
                  <Label className="text-xs">Objetivos</Label>
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded whitespace-pre-wrap">{project.objectives}</p>
                </div>
              )}
              <div className="space-y-1">
                <Label className="text-xs">Criado em</Label>
                <p className="text-sm text-muted-foreground">{new Date(project.created_at).toLocaleString("pt-BR")}</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
