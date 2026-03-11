import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Project,
  ProjectTask,
  useProjectTasks,
  useProjectNotes,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
  TASK_PRIORITY_COLORS,
} from "@/hooks/useProjects";
import {
  ArrowLeft,
  Calendar,
  FileText,
  ImageIcon,
  Receipt,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Loader2,
  StickyNote,
  ListTodo,
  FolderOpen,
  Milestone,
} from "lucide-react";
import { toast } from "sonner";

const GestaoProjetoDetalhe = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const { tasks, addTask, updateTask, deleteTask } = useProjectTasks(projectId || null);
  const { notes, addNote } = useProjectNotes(projectId || null);
  const [newNote, setNewNote] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const fetchProject = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();
    if (error) {
      toast.error("Projeto não encontrado");
      navigate("/gestao-projetos");
    } else {
      setProject(data as unknown as Project);
    }
    setLoading(false);
  }, [projectId, navigate]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    await addNote(newNote);
    setNewNote("");
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    await addTask({ title: newTaskTitle });
    setNewTaskTitle("");
  };

  const taskStats = {
    total: tasks.length,
    done: tasks.filter((t) => t.status === "concluida").length,
    inProgress: tasks.filter((t) => t.status === "em_andamento").length,
    blocked: tasks.filter((t) => t.status === "bloqueada").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/gestao-projetos")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">{project.title}</h1>
            <Badge variant="outline" className={PROJECT_STATUS_COLORS[project.status]}>
              {PROJECT_STATUS_LABELS[project.status]}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            {project.description || project.briefing || "Sem descrição"}
          </p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold">{project.progress}%</p>
            <p className="text-[10px] text-muted-foreground">Progresso</p>
            <Progress value={project.progress} className="h-1 mt-1" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold">{taskStats.total}</p>
            <p className="text-[10px] text-muted-foreground">Tarefas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-green-600">{taskStats.done}</p>
            <p className="text-[10px] text-muted-foreground">Concluídas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold">
              {project.start_date
                ? new Date(project.start_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
                : "—"}
            </p>
            <p className="text-[10px] text-muted-foreground">Início</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold">
              {project.end_date
                ? new Date(project.end_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
                : "—"}
            </p>
            <p className="text-[10px] text-muted-foreground">Fim</p>
          </CardContent>
        </Card>
      </div>

      {/* Main content with tabs */}
      <Tabs defaultValue="etapas">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="etapas" className="gap-1.5">
            <Milestone className="h-3.5 w-3.5" />
            Etapas & Tarefas
          </TabsTrigger>
          <TabsTrigger value="cronograma" className="gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Cronograma
          </TabsTrigger>
          <TabsTrigger value="documentos" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Documentos
          </TabsTrigger>
          <TabsTrigger value="financeiro" className="gap-1.5">
            <Receipt className="h-3.5 w-3.5" />
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="notas" className="gap-1.5">
            <StickyNote className="h-3.5 w-3.5" />
            Notas
          </TabsTrigger>
        </TabsList>

        {/* Etapas & Tarefas */}
        <TabsContent value="etapas" className="mt-4 space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Nova tarefa..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
            />
            <Button onClick={handleAddTask} disabled={!newTaskTitle.trim()}>
              <Plus className="h-4 w-4 mr-1" /> Adicionar
            </Button>
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ListTodo className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Nenhuma tarefa ainda. Adicione acima.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <Card key={task.id} className="group">
                  <CardContent className="p-3 flex items-center gap-3">
                    <button
                      className="shrink-0"
                      onClick={() =>
                        updateTask(task.id, {
                          status: task.status === "concluida" ? "pendente" : "concluida",
                        })
                      }
                    >
                      {task.status === "concluida" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : task.status === "bloqueada" ? (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      ) : task.status === "em_andamento" ? (
                        <Clock className="h-5 w-5 text-blue-500" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${task.status === "concluida" ? "line-through text-muted-foreground" : ""}`}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{task.description}</p>
                      )}
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${TASK_PRIORITY_COLORS[task.priority]}`}>
                      {task.priority}
                    </Badge>
                    {task.due_date && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(task.due_date).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Cronograma - skeleton */}
        <TabsContent value="cronograma" className="mt-4">
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <h3 className="font-semibold text-foreground mb-1">Cronograma de Execução</h3>
              <p className="text-sm">
                Visualize as etapas do projeto em um calendário com marcos e prazos.
              </p>
              <p className="text-xs mt-2 opacity-60">Em desenvolvimento</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documentos - skeleton */}
        <TabsContent value="documentos" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload de Documentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-8 text-center text-muted-foreground">
                <FolderOpen className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">Arraste documentos, fotos ou notas fiscais</p>
                <p className="text-xs mt-1">PDF, JPG, PNG — até 20MB por arquivo</p>
                <p className="text-xs mt-3 opacity-60">Em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-3">
            <Card className="p-4 text-center text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">Documentos</p>
              <p className="text-xs">Contratos, ofícios, relatórios</p>
            </Card>
            <Card className="p-4 text-center text-muted-foreground">
              <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">Fotos</p>
              <p className="text-xs">Registros fotográficos do projeto</p>
            </Card>
            <Card className="p-4 text-center text-muted-foreground">
              <Receipt className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">Notas Fiscais</p>
              <p className="text-xs">Comprovantes de despesas</p>
            </Card>
          </div>
        </TabsContent>

        {/* Financeiro - skeleton */}
        <TabsContent value="financeiro" className="mt-4">
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <h3 className="font-semibold text-foreground mb-1">Gestão Financeira</h3>
              <p className="text-sm">
                Controle de orçamento, despesas e prestação de contas.
              </p>
              {project.budget > 0 && (
                <p className="text-lg font-bold text-foreground mt-3">
                  Orçamento: R$ {project.budget.toLocaleString("pt-BR")}
                </p>
              )}
              <p className="text-xs mt-2 opacity-60">Em desenvolvimento</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notas */}
        <TabsContent value="notas" className="mt-4 space-y-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Adicionar uma nota..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={2}
              className="flex-1"
            />
            <Button onClick={handleAddNote} disabled={!newNote.trim()} className="self-end">
              Salvar
            </Button>
          </div>

          {notes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <StickyNote className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Nenhuma nota ainda.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notes.map((note) => (
                <Card key={note.id}>
                  <CardContent className="p-3">
                    <p className="text-sm">{note.content}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(note.created_at).toLocaleString("pt-BR")} • {note.note_type}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GestaoProjetoDetalhe;
