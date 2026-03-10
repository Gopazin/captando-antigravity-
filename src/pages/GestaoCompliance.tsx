import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import {
  ShieldCheck, Calendar, DollarSign, AlertTriangle, Plus, Clock, CheckCircle2,
  Loader2, BarChart3, FileText, Wallet, Bell,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useProjects, useProjectTasks, PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS, type Project, type ProjectTask } from "@/hooks/useProjects";

interface Rubrica {
  id: string;
  name: string;
  type: "custeio" | "capital";
  planned: number;
  executed: number;
}

const GestaoCompliance = () => {
  const { projects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const selectedProject = projects.find((p) => p.id === selectedProjectId) || null;
  const { tasks } = useProjectTasks(selectedProjectId || null);

  // Mock rubricas for now
  const [rubricas, setRubricas] = useState<Rubrica[]>([
    { id: "1", name: "Recursos Humanos", type: "custeio", planned: 50000, executed: 22000 },
    { id: "2", name: "Material de Consumo", type: "custeio", planned: 15000, executed: 8500 },
    { id: "3", name: "Equipamentos", type: "capital", planned: 30000, executed: 12000 },
    { id: "4", name: "Serviços de Terceiros", type: "custeio", planned: 25000, executed: 10000 },
  ]);

  const [newRubrica, setNewRubrica] = useState({ name: "", type: "custeio" as "custeio" | "capital", planned: "" });
  const [rubricaDialogOpen, setRubricaDialogOpen] = useState(false);

  const totalPlanned = rubricas.reduce((a, r) => a + r.planned, 0);
  const totalExecuted = rubricas.reduce((a, r) => a + r.executed, 0);
  const executionRate = totalPlanned > 0 ? Math.round((totalExecuted / totalPlanned) * 100) : 0;

  const completedTasks = tasks.filter((t) => t.status === "concluida").length;
  const pendingTasks = tasks.filter((t) => t.status === "pendente").length;
  const blockedTasks = tasks.filter((t) => t.status === "bloqueada").length;

  // Simulated compliance alerts
  const alerts = [
    { id: "1", type: "warning" as const, message: "Prestação de contas parcial vence em 15 dias", date: "2026-03-25" },
    { id: "2", type: "critical" as const, message: "Rubrica 'Equipamentos' com execução abaixo de 40%", date: "2026-03-10" },
    { id: "3", type: "info" as const, message: "Relatório trimestral disponível para preenchimento", date: "2026-04-01" },
  ];

  const handleAddRubrica = () => {
    if (!newRubrica.name.trim()) return;
    setRubricas((prev) => [
      ...prev,
      {
        id: String(prev.length + 1),
        name: newRubrica.name,
        type: newRubrica.type,
        planned: Number(newRubrica.planned) || 0,
        executed: 0,
      },
    ]);
    setNewRubrica({ name: "", type: "custeio", planned: "" });
    setRubricaDialogOpen(false);
    toast.success("Rubrica adicionada");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestão & Compliance</h1>
        <p className="text-muted-foreground mt-1">Acompanhamento pós-aprovação, rubricas e prestação de contas</p>
      </div>

      {/* Project selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Label className="text-sm font-medium whitespace-nowrap">Projeto:</Label>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Selecione um projeto para gerenciar" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.title} — {PROJECT_STATUS_LABELS[p.status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {!selectedProjectId ? (
        <div className="text-center py-20 text-muted-foreground">
          <ShieldCheck className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">Selecione um projeto</p>
          <p className="text-sm mt-1">Escolha um projeto acima para acessar o painel de gestão e compliance</p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <DollarSign className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Orçamento Total</p>
                    <p className="text-lg font-bold">R$ {totalPlanned.toLocaleString("pt-BR")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Execução</p>
                    <p className="text-lg font-bold">{executionRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tarefas Concluídas</p>
                    <p className="text-lg font-bold">{completedTasks}/{tasks.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Alertas</p>
                    <p className="text-lg font-bold">{alerts.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="rubricas">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="rubricas"><Wallet className="h-4 w-4 mr-1" /> Rubricas</TabsTrigger>
              <TabsTrigger value="cronograma"><Calendar className="h-4 w-4 mr-1" /> Cronograma</TabsTrigger>
              <TabsTrigger value="alertas"><Bell className="h-4 w-4 mr-1" /> Alertas</TabsTrigger>
            </TabsList>

            {/* Rubricas Tab */}
            <TabsContent value="rubricas" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Gestor de Rubricas</h3>
                  <p className="text-sm text-muted-foreground">Custeio vs Capital — acompanhe a execução orçamentária</p>
                </div>
                <Dialog open={rubricaDialogOpen} onOpenChange={setRubricaDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nova Rubrica</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Adicionar Rubrica</DialogTitle></DialogHeader>
                    <div className="space-y-3 mt-4">
                      <div className="space-y-1">
                        <Label>Nome</Label>
                        <Input value={newRubrica.name} onChange={(e) => setNewRubrica((p) => ({ ...p, name: e.target.value }))} />
                      </div>
                      <div className="space-y-1">
                        <Label>Tipo</Label>
                        <Select value={newRubrica.type} onValueChange={(v) => setNewRubrica((p) => ({ ...p, type: v as "custeio" | "capital" }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="custeio">Custeio</SelectItem>
                            <SelectItem value="capital">Capital</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label>Valor Planejado (R$)</Label>
                        <Input type="number" value={newRubrica.planned} onChange={(e) => setNewRubrica((p) => ({ ...p, planned: e.target.value }))} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setRubricaDialogOpen(false)}>Cancelar</Button>
                      <Button onClick={handleAddRubrica}>Adicionar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Budget progress */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Execução Global</span>
                    <span className="font-medium">R$ {totalExecuted.toLocaleString("pt-BR")} / R$ {totalPlanned.toLocaleString("pt-BR")}</span>
                  </div>
                  <Progress value={executionRate} className="h-3" />
                </CardContent>
              </Card>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rubrica</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Planejado</TableHead>
                    <TableHead>Executado</TableHead>
                    <TableHead>Execução</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rubricas.map((r) => {
                    const pct = r.planned > 0 ? Math.round((r.executed / r.planned) * 100) : 0;
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={r.type === "custeio" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-amber-50 text-amber-700 border-amber-200"}>
                            {r.type === "custeio" ? "Custeio" : "Capital"}
                          </Badge>
                        </TableCell>
                        <TableCell>R$ {r.planned.toLocaleString("pt-BR")}</TableCell>
                        <TableCell>R$ {r.executed.toLocaleString("pt-BR")}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={pct} className="h-1.5 w-20" />
                            <span className="text-xs text-muted-foreground">{pct}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TabsContent>

            {/* Cronograma Tab */}
            <TabsContent value="cronograma" className="space-y-4 mt-4">
              <h3 className="text-lg font-semibold">Cronograma de Execução</h3>
              {tasks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Nenhuma tarefa neste projeto</p>
                  <p className="text-sm mt-1">Adicione tarefas no painel de Gestão de Projetos</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <Card key={task.id}>
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full shrink-0 ${
                          task.status === "concluida" ? "bg-green-500" :
                          task.status === "em_andamento" ? "bg-amber-500" :
                          task.status === "bloqueada" ? "bg-red-500" : "bg-muted-foreground/30"
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${task.status === "concluida" ? "line-through opacity-60" : ""}`}>{task.title}</p>
                          {task.description && <p className="text-xs text-muted-foreground line-clamp-1">{task.description}</p>}
                        </div>
                        {task.due_date && (
                          <span className="text-xs text-muted-foreground shrink-0">
                            {new Date(task.due_date).toLocaleDateString("pt-BR")}
                          </span>
                        )}
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {task.status === "concluida" ? "Concluída" :
                           task.status === "em_andamento" ? "Em andamento" :
                           task.status === "bloqueada" ? "Bloqueada" : "Pendente"}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Alertas Tab */}
            <TabsContent value="alertas" className="space-y-4 mt-4">
              <h3 className="text-lg font-semibold">Alertas de Compliance</h3>
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <Card key={alert.id} className={`border-l-4 ${
                    alert.type === "critical" ? "border-l-destructive" :
                    alert.type === "warning" ? "border-l-warning" : "border-l-accent"
                  }`}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <AlertTriangle className={`h-5 w-5 shrink-0 ${
                        alert.type === "critical" ? "text-destructive" :
                        alert.type === "warning" ? "text-warning" : "text-accent"
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{new Date(alert.date).toLocaleDateString("pt-BR")}</p>
                      </div>
                      <Badge variant="outline" className={`text-xs ${
                        alert.type === "critical" ? "text-destructive border-destructive/30" :
                        alert.type === "warning" ? "text-warning border-warning/30" : "text-accent border-accent/30"
                      }`}>
                        {alert.type === "critical" ? "Crítico" : alert.type === "warning" ? "Atenção" : "Info"}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {blockedTasks > 0 && (
                <Card className="border-destructive/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">{blockedTasks} tarefa(s) bloqueada(s) neste projeto</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default GestaoCompliance;