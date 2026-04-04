import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, CreditCard, Save, Crown, Check, X } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthProvider";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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

const Configuracoes = () => {
  const { user, organization } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    role: "",
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.user_metadata?.full_name || "",
        email: user.email || "",
        role: "Membro da Organização", // This could come from a shared user_meta table too
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: profileData.name },
      });
      if (error) throw error;
      toast.success("Perfil atualizado com sucesso!");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erro ao salvar perfil";
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const currentPlanId = organization?.plan_type || "free";

  return (
    <div className="space-y-6 max-w-3xl pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground mt-1">Gerencie seu perfil, assinatura e organização</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" /> Perfil do Usuário
          </CardTitle>
          <CardDescription>Suas informações pessoais que aparecem nos projetos.</CardDescription>
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
          </div>
          <Button onClick={handleSaveProfile} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Salvar Perfil
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-accent" /> Plano da Organização
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
                    {isCurrent && <Badge variant="secondary">Atual</Badge>}
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
                    {isCurrent ? "Plano Atual" : "Fazer Upgrade"}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Configuracoes;