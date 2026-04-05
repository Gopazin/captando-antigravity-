import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Coins, 
  Database, 
  Activity, 
  Search, 
  PlusCircle, 
  MoreHorizontal, 
  Loader2, 
  BrainCircuit, 
  Pencil, 
  Save, 
  X, 
  Plus, 
  MessageSquare, 
  CheckCircle2,
  Users,
  ShieldCheck,
  ShieldAlert
} from "lucide-react";
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

interface UserRoleInfo {
  user_id: string;
  role: "super_admin" | "gestor" | "membro";
  organization_id: string | null;
  profiles: {
    id: string;
    email: string | null;
    full_name: string | null;
  } | null;
  organizations: {
    name: string;
  } | null;
}

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

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin (Dono)",
  gestor: "Gestor da Org",
  membro: "Membro da Org",
};

export default function PlatformAdmin() {
  const { role: currentUserRole } = useAuth();
  const navigate = useNavigate();

  // Org management
  const [organizations, setOrganizations] = useState<DbOrganization[]>([]);
  const [transactions, setTransactions] = useState<DbTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingCredits, setIsAddingCredits] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [amountToAdd, setAmountToAdd] = useState("100");

  // Users management
  const [users, setUsers] = useState<UserRoleInfo[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");

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
    if (currentUserRole !== "super_admin" && currentUserRole !== null) navigate("/dashboard");
  }, [currentUserRole, navigate]);

  useEffect(() => {
    fetchOrganizations();
    fetchTransactions();
    fetchSkills();
    fetchFeedbacks();
    fetchUsers();
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

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select(`
          user_id,
          role,
          organization_id,
          profiles (
            id,
            email,
            full_name
          ),
          organizations (
            name
          )
        `)
        .order("role", { ascending: true });

      if (!error && data) {
        setUsers(data as unknown as UserRoleInfo[]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUsersLoading(false);
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

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from("user_roles")
      .update({ role: newRole })
      .eq("user_id", userId);

    if (error) {
      toast.error("Erro ao atualizar cargo: " + error.message);
    } else {
      toast.success("Cargo atualizado com sucesso!");
      fetchUsers();
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
        description: "Recarga manual via Painel de Controle"
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
  const filteredUsers = users.filter(u => 
    u.profiles?.full_name?.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
    u.profiles?.email?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.organizations?.name?.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  if (currentUserRole !== "super_admin") return null;

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestão da Plataforma</h1>
            <p className="text-muted-foreground mt-1">Ambiente de controle global para o Super Admin</p>
          </div>
        </div>
      </div>

      {/* Métricas Topo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-l-4 border-l-accent shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Inquilinos</p>
              <p className="text-2xl font-bold mt-1 text-accent">{organizations.length}</p>
            </div>
            <div className="p-3 bg-accent/10 rounded-xl"><Database className="h-5 w-5 text-accent" /></div>
          </CardContent>
        </Card>
        <Card className="glass-card shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Usuários Totais</p>
              <p className="text-2xl font-bold mt-1">{users.length}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl"><Users className="h-5 w-5 text-primary" /></div>
          </CardContent>
        </Card>
        <Card className="glass-card shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Skills Ativas</p>
              <p className="text-2xl font-bold mt-1 text-purple-600">{skills.length}</p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-xl"><BrainCircuit className="h-5 w-5 text-purple-600" /></div>
          </CardContent>
        </Card>
        <Card className="glass-card shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Créditos Circulantes</p>
              <p className="text-2xl font-bold mt-1">{organizations.reduce((acc, org) => acc + (org.credits_balance || 0), 0).toLocaleString()}</p>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl"><Coins className="h-5 w-5 text-amber-500" /></div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="skills" className="space-y-6">
        <TabsList className="h-10 gap-1 bg-muted/30 p-1">
          <TabsTrigger value="skills" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-purple-600">
            <BrainCircuit className="h-4 w-4" /> IA Skills
          </TabsTrigger>
          <TabsTrigger value="organizacoes" className="flex items-center gap-2 data-[state=active]:bg-background">
            <Database className="h-4 w-4" /> Inquilinos
          </TabsTrigger>
          <TabsTrigger value="usuarios" className="flex items-center gap-2 data-[state=active]:bg-background">
            <Users className="h-4 w-4" /> Usuários
          </TabsTrigger>
          <TabsTrigger value="transacoes" className="flex items-center gap-2 data-[state=active]:bg-background">
            <Coins className="h-4 w-4" /> Créditos
          </TabsTrigger>
          <TabsTrigger value="feedbacks" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-accent">
            <MessageSquare className="h-4 w-4" /> Feedbacks
            {feedbacks.filter(f => f.status === 'pendente').length > 0 && (
              <Badge className="ml-1 px-1.5 h-4 bg-accent text-[10px] shadow-sm animate-pulse">{feedbacks.filter(f => f.status === 'pendente').length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ─── TAB: SKILLS STUDIO ─── */}
        <TabsContent value="skills" className="space-y-4">
          <Card className="glass-card border-purple-500/10 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-purple-500" />
                    Skills Studio
                  </CardTitle>
                  <CardDescription>
                    Gerencie os prompts e modelos que movem as avaliações de IA.
                  </CardDescription>
                </div>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm" onClick={() => setIsAddingSkill(true)}>
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
                    <Card key={skill.id} className={`border transition-all ${editingSkill?.id === skill.id ? "border-purple-400 shadow-md" : "border-muted/50 hover:border-purple-400/30"}`}>
                      <CardContent className="p-4">
                        {editingSkill?.id === skill.id ? (
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 flex-wrap">
                              <Badge className={`${LAYER_COLORS[skill.layer]} border`}>{LAYER_LABELS[skill.layer] || skill.layer}</Badge>
                              <span className="font-bold text-sm capitalize">{skill.domain}</span>
                              <span className="text-xs text-muted-foreground">v{skill.version + 1}</span>
                            </div>
                            <div className="space-y-1.5">
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-tighter">Instrução (Prompt)</p>
                              <Textarea
                                rows={8}
                                value={editDraft.instruction}
                                onChange={(e) => setEditDraft(d => ({ ...d, instruction: e.target.value }))}
                                className="text-sm font-mono bg-muted/30 leading-relaxed"
                              />
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex-1 space-y-1.5">
                                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-tighter">Modelo de IA</p>
                                  <Select value={editDraft.model_name} onValueChange={(v) => setEditDraft(d => ({ ...d, model_name: v }))}>
                                    <SelectTrigger className="w-full bg-muted/30">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {MODEL_OPTIONS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex gap-2 self-end">
                                  <Button onClick={handleSaveSkill} disabled={isSavingSkill} size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                                    {isSavingSkill ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />} Salvar Alterações
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => setEditingSkill(null)}><X className="h-4 w-4 mr-1" /> Cancelar</Button>
                                </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge className={`${LAYER_COLORS[skill.layer]} border text-[10px] font-bold`}>{LAYER_LABELS[skill.layer] || skill.layer.toUpperCase()}</Badge>
                                <span className="font-bold text-sm capitalize text-foreground">{skill.domain}</span>
                                <Badge variant="outline" className="text-[10px] text-muted-foreground font-mono bg-muted/10">{skill.model_name}</Badge>
                                <span className="text-[10px] text-muted-foreground font-bold">v{skill.version}</span>
                              </div>
                              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 hover:text-purple-600 hover:bg-purple-50 transition-colors" onClick={() => handleEditSkill(skill)}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                            <div className="relative group">
                              <p className="text-xs text-muted-foreground line-clamp-3 font-mono bg-muted/20 p-3 rounded-md border border-border/50 group-hover:line-clamp-none transition-all">
                                {skill.instruction}
                              </p>
                            </div>
                            <p className="text-[10px] text-muted-foreground/70 italic">Última modificação: {new Date(skill.updated_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── TAB: USERS MANAGEMENT (NEW) ─── */}
        <TabsContent value="usuarios">
          <Card className="glass-card shadow-md border-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Usuários & Acessos
                  </CardTitle>
                  <CardDescription>Gerencie quem tem acesso à plataforma e quais seus níveis de permissão.</CardDescription>
                </div>
              </div>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Filtrar por nome, email ou organização..." 
                  className="pl-9 bg-background/50 border-muted" 
                  value={userSearchQuery} 
                  onChange={(e) => setUserSearchQuery(e.target.value)} 
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-xl overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Organização</TableHead>
                      <TableHead>Nível de Acesso</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersLoading ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                    ) : filteredUsers.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-12 text-muted-foreground">Nenhum usuário encontrado.</TableCell></TableRow>
                    ) : (
                      filteredUsers.map((u) => (
                        <TableRow key={u.user_id} className="hover:bg-muted/20 transition-colors">
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-bold text-sm text-foreground">{u.profiles?.full_name || "Sem Nome"}</span>
                              <span className="text-xs text-muted-foreground">{u.profiles?.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {u.organizations?.name ? (
                              <Badge variant="outline" className="bg-background text-foreground/70 font-medium">
                                {u.organizations.name}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">Sem organização</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Select 
                              value={u.role} 
                              onValueChange={(val) => handleUpdateUserRole(u.user_id, val)}
                            >
                              <SelectTrigger className={`h-8 w-[180px] text-xs font-semibold ${u.role === 'super_admin' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted/50'}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="super_admin" className="text-primary font-bold">Super Admin (Dono)</SelectItem>
                                <SelectItem value="gestor">Gestor da Org</SelectItem>
                                <SelectItem value="membro">Membro da Org</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-right">
                             {u.role === 'super_admin' ? (
                               <ShieldAlert className="h-4 w-4 text-primary ml-auto opacity-50" />
                             ) : (
                               <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                 <MoreHorizontal className="h-4 w-4" />
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

        {/* ─── TAB: INQUILINOS ─── */}
        <TabsContent value="organizacoes">
          <Card className="glass-card shadow-md border-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Inquilinos (Organizações)</CardTitle>
                  <CardDescription>Controle de plano, limites e status operacional das contas.</CardDescription>
                </div>
                <Button size="sm" className="bg-primary text-primary-foreground shadow-sm"><PlusCircle className="h-4 w-4 mr-2" /> Novo Inquilino</Button>
              </div>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por nome ou CNPJ..." className="pl-9 bg-background/50 border-muted" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-xl overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead>Organização</TableHead>
                      <TableHead>CNPJ/Local</TableHead>
                      <TableHead>Plano Atual</TableHead>
                      <TableHead className="text-right">Créditos Disponíveis</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-12">Carregando...</TableCell></TableRow>
                    ) : filteredOrgs.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-12 text-muted-foreground">Nenhum inquilino encontrado.</TableCell></TableRow>
                    ) : (
                      filteredOrgs.map((org) => (
                        <TableRow key={org.id} className="hover:bg-muted/20 transition-colors">
                          <TableCell className="font-bold flex items-center gap-2">
                             <Database className="h-3.5 w-3.5 text-muted-foreground" />
                             {org.name}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col text-[11px] text-muted-foreground">
                              <span>{org.cnpj || "CNPJ não informado"}</span>
                              <span>{org.location}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={org.plan_type === 'pro' ? 'default' : 'secondary'} className={org.plan_type === 'pro' ? 'bg-primary/20 text-primary border-primary/30 hover:bg-primary/30' : 'bg-muted text-muted-foreground font-medium'}>
                              {(org.plan_type || "free").toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-3">
                              <span className="font-mono font-bold text-sm text-foreground/80">{org.credits_balance?.toLocaleString()}</span>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 border-accent/20 text-accent hover:bg-accent/5 hover:text-accent" 
                                onClick={() => setSelectedOrgId(org.id)}
                              >
                                <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
                                Carregar
                              </Button>
                            </div>
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

        {/* ─── TAB: CRÉDITOS ─── */}
        <TabsContent value="transacoes">
          <Card className="glass-card border-muted shadow-md">
            <CardHeader>
              <CardTitle>Histórico de Transações</CardTitle>
              <CardDescription>Visualização em tempo real do fluxo de créditos na plataforma.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-xl shadow-sm overflow-hidden text-xs">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Origem</TableHead>
                      <TableHead>Atividade/Motivo</TableHead>
                      <TableHead className="text-right">Montante</TableHead>
                      <TableHead className="text-right">Resultante</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id} className="hover:bg-muted/10">
                        <TableCell className="text-muted-foreground font-light">{new Date(tx.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</TableCell>
                        <TableCell className="font-bold text-foreground">{tx.organizations?.name || "Global"}</TableCell>
                        <TableCell className="text-muted-foreground italic font-medium">{tx.description}</TableCell>
                        <TableCell className={`text-right font-bold tabular-nums ${tx.amount > 0 ? "text-success" : "text-destructive"}`}>
                          {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                        </TableCell>
                        <TableCell className="text-right font-bold font-mono text-foreground/70">{tx.new_balance.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── TAB: FEEDBACKS ─── */}
        <TabsContent value="feedbacks">
          <Card className="glass-card shadow-md border-accent/10">
            <CardHeader>
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-accent/10 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-accent" />
                 </div>
                 <div>
                    <CardTitle>Feedback de Usuários</CardTitle>
                    <CardDescription>Escute o que seus clientes estão sugerindo.</CardDescription>
                 </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-xl overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead>Recebido em</TableHead>
                      <TableHead>Org</TableHead>
                      <TableHead>Depoimento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feedbacksLoading ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-12">Processando...</TableCell></TableRow>
                    ) : feedbacks.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground italic">Céus limpos. Sem reclamações no radar.</TableCell></TableRow>
                    ) : (
                      feedbacks.map((fb) => (
                        <TableRow key={fb.id} className="hover:bg-muted/10 transition-colors">
                          <TableCell className="text-[10px] text-muted-foreground uppercase font-bold">
                            {new Date(fb.created_at).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell className="font-bold text-sm">{fb.organizations?.name || "Guest"}</TableCell>
                          <TableCell className="max-w-[350px]">
                            <div className="flex flex-col gap-1.5 p-2 bg-muted/20 rounded-md border border-border/30">
                              <span className="text-sm font-medium leading-relaxed italic text-foreground/80">"{fb.message}"</span>
                              {fb.ai_hint && (
                                <div className="flex items-start gap-2 pt-1.5 border-t border-border/20">
                                   <BrainCircuit className="h-3 w-3 text-purple-400 mt-0.5 shrink-0" />
                                   <span className="text-[10px] text-muted-foreground/80 leading-normal">{fb.ai_hint}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={fb.status === 'pendente' ? 'outline' : 'default'} 
                              className={`text-[9px] font-bold tracking-widest ${fb.status === 'pendente' ? 'text-amber-600 border-amber-600/30 bg-amber-50/50' : 'bg-success/15 text-success border-success/30'}`}
                            >
                              {fb.status?.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {fb.status === 'pendente' ? (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 text-success hover:bg-success/10 rounded-full"
                                onClick={() => handleResolveFeedback(fb.id)}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            ) : (
                               <CheckCircle2 className="h-4 w-4 text-success opacity-50 ml-auto" />
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
          <Card className="w-full max-w-sm shadow-2xl border-accent/20 animate-in zoom-in-95">
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-accent/10 rounded-full w-fit mb-2">
                 <Coins className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Injetar Créditos</CardTitle>
              <CardDescription>Defina a quantidade de tokens para <strong>{organizations.find(o => o.id === selectedOrgId)?.name}</strong></CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Saldo a Adicionar</label>
                <div className="relative">
                   <Coins className="absolute left-3 top-3 h-4 w-4 text-accent/50" />
                   <Input type="number" className="pl-9 text-lg font-bold" value={amountToAdd} onChange={(e) => setAmountToAdd(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="ghost" className="flex-1" onClick={() => setSelectedOrgId(null)}>Desistir</Button>
                <Button className="flex-1 bg-accent hover:bg-accent/90 shadow-md font-bold" onClick={handleAddCredits} disabled={isAddingCredits}>
                  {isAddingCredits ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar Carga"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
