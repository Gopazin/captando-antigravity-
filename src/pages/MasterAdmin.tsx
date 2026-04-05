import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, Database, Activity, ShieldAlert, Search, PlusCircle, MoreHorizontal, Loader2, BrainCircuit, Pencil, Save, X, Plus, MessageSquare, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthProvider";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";

type DbOrganization = Tables<"organizations">;
type DbTransaction = Tables<"credit_transactions"> & { organizations: { name: string } | null };
type DbFeedback = {
  id: string;
  message: string;
  ai_hint: string;
  status: string;
  created_at: string;
  user_id: string;
  organization_id: string;
  organizations: { name: string } | null;
};

interface Skill {
  id: string;
  domain: string;
  layer: string;
  instruction: string;
  model_name: string;
  version: number;
  updated_at: string;
}

const LAYER_LABELS: Record<string, string> = {
  conformidade: "Conformidade",
  merito: "Mérito",
  alinhamento: "Alinhamento",
};

const LAYER_COLORS: Record<string, string> = {
  conformidade: "bg-blue-100 text-blue-700 border-blue-200",
  merito: "bg-purple-100 text-purple-700 border-purple-200",
  alinhamento: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const MODEL_OPTIONS = [
  { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash (Rápido / Barato)" },
  { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro (Poderoso / Preciso)" },
  { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash (Mais Recente)" },
];

export default function MasterAdmin() {
  const { role } = useAuth();
  const navigate = useNavigate();

  // Org management
  const [organizations, setOrganizations] = useState<DbOrganization[]>([]);
  const [transactions, setTransactions] = useState<DbTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingCredits, setIsAddingCredits] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [amountToAdd, setAmountToAdd] = useState("100");

  // Skills Studio
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [editDraft, setEditDraft] = useState<{ instruction: string; model_name: string }>({ instruction: "", model_name: "gemini-1.5-pro" });
  const [isSavingSkill, setIsSavingSkill] = useState(false);
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [newSkill, setNewSkill] = useState({ domain: "", layer: "merito", instruction: "", model_name: "gemini-1.5-pro" });

  // Feedbacks
  const [feedbacks, setFeedbacks] = useState<DbFeedback[]>([]);
  const [feedbacksLoading, setFeedbacksLoading] = useState(false);

  useEffect(() => {
    if (role !== "super_admin" && role !== null) navigate("/dashboard");
  }, [role, navigate]);

  useEffect(() => {
    fetchOrganizations();
    fetchTransactions();
    fetchSkills();
    fetchFeedbacks();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase.from("organizations").select("*").order("name", { ascending: true });
      if (!error && data) setOrganizations(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from("credit_transactions")
        .select("*, organizations(name)")
        .order("created_at", { ascending: false })
        .limit(15);
      if (!error && data) setTransactions(data as DbTransaction[]);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSkills = async () => {
    setSkillsLoading(true);
    const { data } = await supabase.from("evaluation_skills").select("*").order("domain").order("layer");
    if (data) setSkills(data as Skill[]);
    setSkillsLoading(false);
  };
  
  const fetchFeedbacks = async () => {
    setFeedbacksLoading(true);
    try {
      const { data, error } = await supabase
        .from("feedbacks")
        .select("*, organizations(name)")
        .order("created_at", { ascending: false });
      
      if (!error && data) {
        setFeedbacks(data as unknown as DbFeedback[]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFeedbacksLoading(false);
    }
  };

  const handleResolveFeedback = async (id: string) => {
    const { error } = await supabase
      .from("feedbacks")
      .update({ status: "resolvido" })
      .eq("id", id);
    
    if (error) {
      toast.error("Erro ao atualizar feedback.");
    } else {
      toast.success("Feedback marcado como resolvido!");
      fetchFeedbacks();
    }
  };

  const handleAddCredits = async () => {
    if (!selectedOrgId || !amountToAdd) return;
    setIsAddingCredits(true);
    try {
      const amount = parseInt(amountToAdd);
      const { data: org } = await supabase.from("organizations").select("credits_balance").eq("id", selectedOrgId).single();
      const current = org?.credits_balance || 0;
      const newVal = current + amount;
      const { error } = await supabase.from("organizations").update({ credits_balance: newVal }).eq("id", selectedOrgId);
      if (error) throw error;
      await supabase.from("credit_transactions").insert({
        organization_id: selectedOrgId, amount, previous_balance: current, new_balance: newVal,
        description: "Recarga manual via Master Admin"
      });
      toast.success("Créditos adicionados!");
      fetchOrganizations();
      fetchTransactions();
      setSelectedOrgId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao adicionar créditos");
    } finally {
      setIsAddingCredits(false);
    }
  };

  const handleEditSkill = (skill: Skill) => {
    setEditingSkill(skill);
    setEditDraft({ instruction: skill.instruction, model_name: skill.model_name });
  };

  const handleSaveSkill = async () => {
    if (!editingSkill) return;
    setIsSavingSkill(true);
    const { error } = await supabase
      .from("evaluation_skills")
      .update({ instruction: editDraft.instruction, model_name: editDraft.model_name, version: editingSkill.version + 1, updated_at: new Date().toISOString() })
      .eq("id", editingSkill.id);
    if (error) {
      toast.error("Erro ao salvar a Skill.");
    } else {
      toast.success("✅ Skill atualizada! A IA já usa as novas instruções.");
      setEditingSkill(null);
      fetchSkills();
    }
    setIsSavingSkill(false);
  };

  const handleAddSkill = async () => {
    if (!newSkill.domain || !newSkill.instruction) { toast.error("Domínio e instrução são obrigatórios."); return; }
    setIsSavingSkill(true);
    const { error } = await supabase.from("evaluation_skills").insert(newSkill);
    if (error) {
      toast.error(error.message.includes("unique") ? "Já existe uma Skill para este domínio + camada." : "Erro ao criar Skill.");
    } else {
      toast.success("Nova Skill criada com sucesso!");
      setIsAddingSkill(false);
      setNewSkill({ domain: "", layer: "merito", instruction: "", model_name: "gemini-1.5-pro" });
      fetchSkills();
    }
    setIsSavingSkill(false);
  };

  const filteredOrgs = organizations.filter(org => org.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (role !== "super_admin") return null;

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Super Admin Hub</h1>
        <p className="text-muted-foreground mt-1">Gestão global de Inquilinos, IA e Feedbacks</p>
      </div>

      {/* Métricas Topo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-l-4 border-l-accent">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Total de Inquilinos</p>
              <p className="text-2xl font-bold mt-1">{organizations.length}</p>
            </div>
            <div className="p-3 bg-accent/10 rounded-xl"><Database className="h-5 w-5 text-accent" /></div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Créditos Circulantes</p>
              <p className="text-2xl font-bold mt-1">{organizations.reduce((acc, org) => acc + (org.credits_balance || 0), 0).toLocaleString()}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl"><Coins className="h-5 w-5 text-primary" /></div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Skills de IA Ativas</p>
              <p className="text-2xl font-bold mt-1">{skills.length}</p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-xl"><BrainCircuit className="h-5 w-5 text-purple-500" /></div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Assinantes PRO</p>
              <p className="text-2xl font-bold mt-1">{organizations.filter(o => o.plan_type === 'pro').length}</p>
            </div>
            <div className="p-3 bg-success/10 rounded-xl"><Activity className="h-5 w-5 text-success" /></div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="skills" className="space-y-6">
        <TabsList className="h-10 gap-1">
          <TabsTrigger value="skills" className="flex items-center gap-2 data-[state=active]:text-purple-600">
            <BrainCircuit className="h-4 w-4" /> Skills de IA
          </TabsTrigger>
          <TabsTrigger value="organizacoes" className="flex items-center gap-2">
            <Database className="h-4 w-4" /> Inquilinos
          </TabsTrigger>
          <TabsTrigger value="transacoes" className="flex items-center gap-2">
            <Coins className="h-4 w-4" /> Créditos
          </TabsTrigger>
          <TabsTrigger value="feedbacks" className="flex items-center gap-2 data-[state=active]:text-accent">
            <MessageSquare className="h-4 w-4" /> Feedbacks
            {feedbacks.filter(f => f.status === 'pendente').length > 0 && (
              <Badge className="ml-1 px-1.5 h-4 bg-accent text-[10px]">{feedbacks.filter(f => f.status === 'pendente').length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ─── TAB: SKILLS STUDIO ─── */}
        <TabsContent value="skills" className="space-y-4">
          <Card className="glass-card border-purple-500/20 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-purple-500" />
                    Skills Studio
                  </CardTitle>
                  <CardDescription>
                    Cada Skill é o "cérebro" da avaliação de um domínio específico. Edite o texto abaixo e a IA muda seu comportamento instantaneamente.
                  </CardDescription>
                </div>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => setIsAddingSkill(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Nova Skill
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {skillsLoading ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-purple-500" /></div>
              ) : (
                <div className="grid gap-3">
                  {skills.map((skill) => (
                    <Card key={skill.id} className={`border transition-all ${editingSkill?.id === skill.id ? "border-purple-400 shadow-md" : "border-muted/50 hover:border-purple-400/50"}`}>
                      <CardContent className="p-4">
                        {editingSkill?.id === skill.id ? (
                          // ─ Edit Mode ─
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 flex-wrap">
                              <Badge className={`${LAYER_COLORS[skill.layer]} border`}>{LAYER_LABELS[skill.layer] || skill.layer}</Badge>
                              <span className="font-bold text-sm capitalize">{skill.domain}</span>
                              <span className="text-xs text-muted-foreground">v{skill.version + 1}</span>
                            </div>
                            <div className="space-y-1.5">
                              <p className="text-xs font-medium text-muted-foreground">Instrução (Prompt)</p>
                              <Textarea
                                rows={6}
                                value={editDraft.instruction}
                                onChange={(e) => setEditDraft(d => ({ ...d, instruction: e.target.value }))}
                                className="text-sm font-mono bg-muted/30"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <p className="text-xs font-medium text-muted-foreground">Modelo de IA</p>
                              <Select value={editDraft.model_name} onValueChange={(v) => setEditDraft(d => ({ ...d, model_name: v }))}>
                                <SelectTrigger className="w-full bg-muted/30">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {MODEL_OPTIONS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={handleSaveSkill} disabled={isSavingSkill} size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                                {isSavingSkill ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />} Salvar
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setEditingSkill(null)}><X className="h-4 w-4 mr-1" /> Cancelar</Button>
                            </div>
                          </div>
                        ) : (
                          // ─ View Mode ─
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge className={`${LAYER_COLORS[skill.layer]} border text-[10px]`}>{LAYER_LABELS[skill.layer] || skill.layer}</Badge>
                                <span className="font-bold text-sm capitalize">{skill.domain}</span>
                                <Badge variant="outline" className="text-[10px] text-muted-foreground">{skill.model_name}</Badge>
                                <span className="text-[10px] text-muted-foreground">v{skill.version}</span>
                              </div>
                              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 hover:text-purple-600" onClick={() => handleEditSkill(skill)}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-3 font-mono bg-muted/20 p-2 rounded-md">{skill.instruction}</p>
                            <p className="text-[10px] text-muted-foreground">Atualizado: {new Date(skill.updated_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add New Skill Modal */}
          {isAddingSkill && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <Card className="w-full max-w-lg shadow-2xl border-purple-400/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><BrainCircuit className="h-5 w-5 text-purple-500" /> Nova Skill de IA</CardTitle>
                  <CardDescription>Crie uma nova instrução para um domínio específico.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium">Domínio</p>
                      <Input placeholder="ex: saude, esporte..." value={newSkill.domain} onChange={(e) => setNewSkill(s => ({ ...s, domain: e.target.value.toLowerCase() }))} />
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium">Camada</p>
                      <Select value={newSkill.layer} onValueChange={(v) => setNewSkill(s => ({ ...s, layer: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="conformidade">Conformidade</SelectItem>
                          <SelectItem value="merito">Mérito</SelectItem>
                          <SelectItem value="alinhamento">Alinhamento</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium">Modelo de IA</p>
                    <Select value={newSkill.model_name} onValueChange={(v) => setNewSkill(s => ({ ...s, model_name: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{MODEL_OPTIONS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium">Instrução (Prompt do Avaliador)</p>
                    <Textarea rows={5} placeholder="Aja como um avaliador especializado em... Foque em..." value={newSkill.instruction} onChange={(e) => setNewSkill(s => ({ ...s, instruction: e.target.value }))} className="font-mono text-sm" />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setIsAddingSkill(false)}>Cancelar</Button>
                    <Button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white" onClick={handleAddSkill} disabled={isSavingSkill}>
                      {isSavingSkill ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
                      Criar Skill
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* ─── TAB: INQUILINOS ─── */}
        <TabsContent value="organizacoes">
          <Card className="glass-card shadow-lg border-primary/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Inquilinos (Organizações)</CardTitle>
                  <CardDescription>Gerencie limites, bloqueios e créditos por conta.</CardDescription>
                </div>
                <Button size="sm" className="bg-accent hover:bg-accent/90"><PlusCircle className="h-4 w-4 mr-2" /> Novo Inquilino</Button>
              </div>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por nome..." className="pl-9 bg-background/50" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Organização</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead className="text-right">Créditos IA</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-6">Carregando...</TableCell></TableRow>
                    ) : filteredOrgs.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">Nenhuma organização encontrada.</TableCell></TableRow>
                    ) : (
                      filteredOrgs.map((org) => (
                        <TableRow key={org.id}>
                          <TableCell className="font-medium">{org.name}</TableCell>
                          <TableCell>
                            <Badge variant={org.plan_type === 'pro' ? 'default' : 'secondary'} className={org.plan_type === 'pro' ? 'bg-accent/20 text-accent hover:bg-accent/30' : ''}>
                              {(org.plan_type || "free").toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="font-mono font-medium">{org.credits_balance?.toLocaleString()}</span>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-accent" onClick={() => setSelectedOrgId(org.id)}>
                                <PlusCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── TAB: CRÉDITOS ─── */}
        <TabsContent value="transacoes">
          <Card className="glass-card border-primary/10">
            <CardHeader>
              <CardTitle>Transações de Créditos Recentes</CardTitle>
              <CardDescription>Log global de consumo de IA e recargas.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Organização</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Movimentação</TableHead>
                    <TableHead className="text-right">Saldo Final</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleString('pt-BR')}</TableCell>
                      <TableCell className="font-medium">{tx.organizations?.name || "Desconhecida"}</TableCell>
                      <TableCell className="text-sm">{tx.description}</TableCell>
                      <TableCell className={`text-right font-bold ${tx.amount > 0 ? "text-success" : "text-destructive"}`}>
                        {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                      </TableCell>
                      <TableCell className="text-right font-mono">{tx.new_balance}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── TAB: FEEDBACKS ─── */}
        <TabsContent value="feedbacks">
          <Card className="glass-card shadow-lg border-accent/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-accent" />
                Voz do Usuário
              </CardTitle>
              <CardDescription>Sugestões e feedbacks capturados pela plataforma.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Organização</TableHead>
                      <TableHead>Mensagem</TableHead>
                      <TableHead>Sugestão IA</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feedbacksLoading ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-6">Carregando...</TableCell></TableRow>
                    ) : feedbacks.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">Nenhum feedback recebido ainda.</TableCell></TableRow>
                    ) : (
                      feedbacks.map((fb) => (
                        <TableRow key={fb.id}>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(fb.created_at).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell className="font-medium">{fb.organizations?.name || "N/A"}</TableCell>
                          <TableCell className="max-w-[250px] text-sm italic">"{fb.message}"</TableCell>
                          <TableCell className="max-w-[200px] text-[11px] text-muted-foreground">{fb.ai_hint}</TableCell>
                          <TableCell>
                            <Badge variant={fb.status === 'pendente' ? 'outline' : 'default'} className={fb.status === 'pendente' ? 'text-amber-500 border-amber-500/20' : 'bg-emerald-500/20 text-emerald-500 border-emerald-500/20'}>
                              {fb.status?.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {fb.status === 'pendente' && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-emerald-500 hover:bg-emerald-500/10"
                                onClick={() => handleResolveFeedback(fb.id)}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal: Adicionar Créditos */}
      {selectedOrgId && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm shadow-2xl">
            <CardHeader>
              <CardTitle>Adicionar Créditos</CardTitle>
              <CardDescription>Injetar créditos para <strong>{organizations.find(o => o.id === selectedOrgId)?.name}</strong></CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantidade</label>
                <Input type="number" value={amountToAdd} onChange={(e) => setAmountToAdd(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedOrgId(null)}>Cancelar</Button>
                <Button className="flex-1 bg-accent hover:bg-accent/90" onClick={handleAddCredits} disabled={isAddingCredits}>
                  {isAddingCredits ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
