import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ProjectStatus = "ideacao" | "elaboracao" | "revisao" | "submissao" | "aprovado" | "em_execucao" | "concluido" | "arquivado";
export type TaskStatus = "pendente" | "em_andamento" | "concluida" | "bloqueada";
export type TaskPriority = "baixa" | "media" | "alta" | "urgente";

export interface Project {
  id: string;
  title: string;
  description: string;
  grant_id: string | null;
  status: ProjectStatus;
  briefing: string;
  generated_title: string;
  justification: string;
  objectives: string;
  methodology: string;
  budget: number;
  start_date: string | null;
  end_date: string | null;
  progress: number;
  ai_notes: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectTask {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  assigned_to: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectNote {
  id: string;
  project_id: string;
  content: string;
  note_type: string;
  created_at: string;
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  ideacao: "Ideação",
  elaboracao: "Elaboração",
  revisao: "Revisão",
  submissao: "Submissão",
  aprovado: "Aprovado",
  em_execucao: "Em Execução",
  concluido: "Concluído",
  arquivado: "Arquivado",
};

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  ideacao: "bg-blue-100 text-blue-700 border-blue-200",
  elaboracao: "bg-amber-100 text-amber-700 border-amber-200",
  revisao: "bg-purple-100 text-purple-700 border-purple-200",
  submissao: "bg-cyan-100 text-cyan-700 border-cyan-200",
  aprovado: "bg-green-100 text-green-700 border-green-200",
  em_execucao: "bg-emerald-100 text-emerald-700 border-emerald-200",
  concluido: "bg-teal-100 text-teal-700 border-teal-200",
  arquivado: "bg-gray-100 text-gray-500 border-gray-200",
};

export const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  baixa: "bg-slate-100 text-slate-600",
  media: "bg-blue-100 text-blue-600",
  alta: "bg-orange-100 text-orange-600",
  urgente: "bg-red-100 text-red-600",
};

export const KANBAN_COLUMNS: ProjectStatus[] = [
  "ideacao", "elaboracao", "revisao", "submissao", "aprovado", "em_execucao", "concluido",
];

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .neq("status", "arquivado")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching projects:", error);
      toast.error("Erro ao carregar projetos");
    } else {
      setProjects((data as unknown as Project[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProjects();
    const channel = supabase
      .channel("projects-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, () => fetchProjects())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchProjects]);

  const updateProjectStatus = async (projectId: string, status: ProjectStatus) => {
    const { error } = await supabase
      .from("projects")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", projectId);
    if (error) {
      toast.error("Erro ao atualizar status");
      return false;
    }
    // Add note
    await supabase.from("project_notes").insert({
      project_id: projectId,
      content: `Status alterado para "${PROJECT_STATUS_LABELS[status]}"`,
      note_type: "status_change",
    });
    return true;
  };

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    const { error } = await supabase
      .from("projects")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", projectId);
    if (error) {
      toast.error("Erro ao atualizar projeto");
      return false;
    }
    return true;
  };

  const createProject = async (project: Partial<Project>) => {
    const { data, error } = await supabase
      .from("projects")
      .insert({ title: project.title || "Novo Projeto", ...project })
      .select()
      .single();
    if (error) {
      toast.error("Erro ao criar projeto");
      return null;
    }
    return data as unknown as Project;
  };

  return { projects, loading, fetchProjects, updateProjectStatus, updateProject, createProject };
}

export function useProjectTasks(projectId: string | null) {
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("project_tasks")
      .select("*")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true });
    if (error) console.error("Error fetching tasks:", error);
    else setTasks((data as unknown as ProjectTask[]) || []);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetchTasks();
    if (!projectId) return;
    const channel = supabase
      .channel(`tasks-${projectId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "project_tasks", filter: `project_id=eq.${projectId}` }, () => fetchTasks())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [projectId, fetchTasks]);

  const addTask = async (task: Partial<ProjectTask>) => {
    if (!projectId) return null;
    const { data, error } = await supabase
      .from("project_tasks")
      .insert({ project_id: projectId, title: task.title || "", ...task })
      .select()
      .single();
    if (error) { toast.error("Erro ao criar tarefa"); return null; }
    return data as unknown as ProjectTask;
  };

  const updateTask = async (taskId: string, updates: Partial<ProjectTask>) => {
    const { error } = await supabase
      .from("project_tasks")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", taskId);
    if (error) { toast.error("Erro ao atualizar tarefa"); return false; }
    return true;
  };

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from("project_tasks")
      .delete()
      .eq("id", taskId);
    if (error) { toast.error("Erro ao excluir tarefa"); return false; }
    return true;
  };

  return { tasks, loading: loading, fetchTasks, addTask, updateTask, deleteTask };
}

export function useProjectNotes(projectId: string | null) {
  const [notes, setNotes] = useState<ProjectNote[]>([]);

  const fetchNotes = useCallback(async () => {
    if (!projectId) return;
    const { data } = await supabase
      .from("project_notes")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(50);
    setNotes((data as unknown as ProjectNote[]) || []);
  }, [projectId]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const addNote = async (content: string, noteType = "manual") => {
    if (!projectId) return;
    await supabase.from("project_notes").insert({
      project_id: projectId, content, note_type: noteType,
    });
    fetchNotes();
  };

  return { notes, addNote, fetchNotes };
}
