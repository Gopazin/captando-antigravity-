import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, CreditCard, Save, Crown, Check, X, Users, 
  UserPlus, Shield, ShieldCheck, Trash2, Loader2, AlertCircle 
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthProvider";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SUBSCRIPTION_PLANS = [
  {
    id: "free",
    name: "Free",
    price: "Grátis",
    features: [
      { text: "1 projeto ativo", included: true },
      { text: "Cofre de Identidade", included: true },
      { text: "Banco de Editais manual", included: true },
      { text: "Busca automática de editais", included: false },
      { text: "IA Orçamentária", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "R$ 97/mês",
    features: [
      { text: "Projetos ilimitados", included: true },
      { text: "Radar de Editais Completo", included: true },
      { text: "Busca automática diária", included: true },
      { text: "IA Orçamentária completa", included: true },
      { text: "Gestão & Compliance", included: true },
    ],
  },
];

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  org_admin: "Administrador",
  org_member: "Funcionário",
};

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  profiles: {
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  } | null;
}

const Configuracoes = () => {
  const { user, organization, role } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("perfil");
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    role_label: "",
  });

  // Team management state
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isFetchingTeam, setIsFetchingTeam] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.user_metadata?.full_name || "",
        email: user.email || "",
        role_label: ROLE_LABELS[role || ""] || "Membro",
      });
    }
  }, [user, role]);

  useEffect(() => {
    if (activeTab === "equipe" && organization?.id) {
      fetchTeam();
    }
  }, [activeTab, organization?.id]);

  const fetchTeam = async () => {
    if (!organization?.id) return;
    setIsFetchingTeam(true);
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select(`
          id,
          user_id,
          role,
          profiles:user_id (
            full_name,
            email,
            avatar_url
          )
        `)
        .eq("organization_id", organization.id);

      if (error) throw error;
      setTeam(data as unknown as TeamMember[]);
    } catch (err) {
      console.error("Error fetching team:", err);
      toast.error("Erro ao carregar equipe");
    } finally {
      setIsFetchingTeam(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("id", memberId);

      if (error) throw error;
      toast.success("Cargo atualizado!");
      fetchTeam();
    } catch (err) {
      toast.error("Erro ao atualizar cargo");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Tem certeza que deseja remover este membro?")) return;
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", memberId);

      if (error) throw error;
      toast.success("Membro removido");
      fetchTeam();
    } catch (err) {
      toast.error("Erro ao remover membro");
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: profileData.name },
      });
      if (error) throw error;
      
      // Also update profiles table
      const { error: pError } = await supabase
        .from("profiles")
        .update({ full_name: profileData.name })
        .eq("id", user?.id);
      
      if (pError) console.error("Error updating public profile:", pError);
      
      toast.success("Perfil atualizado com sucesso!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar perfil");
    } finally {
      setIsSaving(false);
    }
  };

  const isAdmin = role === "super_admin" || role === "org_admin";
  const currentPlanId = organization?.plan_type || "free";

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground mt-1">Gerencie seu perfil, equipe e organização</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="perfil" className="flex items-center gap-2">
            <User className="h-4 w-4" /> Perfil
          </TabsTrigger>
          <TabsTrigger value="equipe" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Equipe
          </TabsTrigger>
          <TabsTrigger value="plano" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" /> Assinatura
          </TabsTrigger>
        </TabsList>

        <TabsContent value="perfil" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-accent" /> Perfil Institucional
              </CardTitle>
              <CardDescription>Suas informações de acesso no <strong>{organization?.name}</strong>.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <Input 
                    value={profileData.name} 
                    onChange={(e) => setProfileData(p => ({ ...p, name: e.target.value }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input value={profileData.email} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Seu Cargo</Label>
                  <div className="px-3 py-2 bg-muted/50 rounded-md border flex items-center gap-2">
                    <Shield className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium">{profileData.role_label}</span>
                  </div>
                </div>
              </div>
              <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Salvar Alterações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipe" className="space-y-6">
          <Card className="glass-card border-accent/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-accent" /> Membros da Organização
                  </CardTitle>
                  <CardDescription>Gerencie quem tem acesso aos projetos do <strong>{organization?.name}</strong>.</CardDescription>
                </div>
                {isAdmin && (
                  <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    <UserPlus className="h-4 w-4 mr-2" /> Convidar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isFetchingTeam ? (
                <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Membro</TableHead>
                        <TableHead>E-mail</TableHead>
                        <TableHead>Cargo</TableHead>
                        {isAdmin && <TableHead className="w-[100px] text-right">Ações</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {team.map((member) => (
                        <TableRow key={member.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="font-medium">
                            {member.profiles?.full_name || "Usuário sem nome"}
                            {member.user_id === user?.id && <Badge variant="outline" className="ml-2 text-[10px] py-0">Você</Badge>}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{member.profiles?.email}</TableCell>
                          <TableCell>
                            {isAdmin && member.user_id !== user?.id ? (
                              <Select 
                                defaultValue={member.role} 
                                onValueChange={(val) => handleUpdateRole(member.id, val)}
                              >
                                <SelectTrigger className="h-8 w-[140px] text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="org_admin">Administrador</SelectItem>
                                  <SelectItem value="org_member">Funcionário</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge variant="secondary" className="text-[10px]">
                                {ROLE_LABELS[member.role] || member.role}
                              </Badge>
                            )}
                          </TableCell>
                          {isAdmin && (
                            <TableCell className="text-right">
                              {member.user_id !== user?.id && (
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                  onClick={() => handleRemoveMember(member.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {isAdmin && (
                <div className="mt-6 p-4 border border-dashed rounded-lg bg-accent/5">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-accent mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-accent">Como adicionar funcionários?</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Para adicionar um novo membro, peça para que ele se cadastre no Captando com o e-mail corporativo. 
                        Após o cadastro, você poderá vinculá-lo à sua organização através do botão "Convidar" (em breve automatizado).
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plano">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-accent" /> Plano e Consumo
              </CardTitle>
              <CardDescription>Gestão da assinatura do <strong>{organization?.name || "seu grupo"}</strong>.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SUBSCRIPTION_PLANS.map((plan) => {
                  const isCurrent = plan.id === currentPlanId;
                  return (
                    <div
                      key={plan.id}
                      className={`p-5 rounded-xl border-2 transition-colors ${
                        isCurrent
                          ? "border-primary/30 bg-primary/5"
                          : "border-accent/30 bg-accent/5 hover:border-accent"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {!isCurrent && <Crown className="h-4 w-4 text-accent" />}
                          <h3 className="font-bold text-lg">{plan.name}</h3>
                        </div>
                        {isCurrent && <Badge variant="secondary" className="bg-success/20 text-success border-success/20">Atual</Badge>}
                      </div>
                      <p className="text-2xl font-bold mb-4">{plan.price}</p>
                      <ul className="space-y-2">
                        {plan.features.map((f) => (
                          <li key={f.text} className="flex items-center gap-2 text-sm">
                            {f.included ? (
                              <Check className="h-4 w-4 text-accent shrink-0" />
                            ) : (
                              <X className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                            )}
                            <span className={f.included ? "" : "text-muted-foreground/60"}>{f.text}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        className={`w-full mt-4 ${isCurrent ? "" : "bg-accent hover:bg-accent/90 text-accent-foreground"}`}
                        variant={isCurrent ? "outline" : "default"}
                        disabled={isCurrent}
                      >
                        {isCurrent ? "Plano Ativo" : "Fazer Upgrade"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Configuracoes;