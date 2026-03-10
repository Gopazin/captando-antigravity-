import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, CreditCard, Save, Crown, Check, X } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "Grátis",
    current: true,
    features: [
      { text: "1 projeto ativo", included: true },
      { text: "Banco de Editais manual", included: true },
      { text: "Cofre de Identidade", included: true },
      { text: "Busca automática de editais", included: false },
      { text: "IA Orçamentária", included: false },
      { text: "Gestão & Compliance", included: false },
    ],
  },
  {
    name: "Pro",
    price: "R$ 97/mês",
    current: false,
    features: [
      { text: "Projetos ilimitados", included: true },
      { text: "Radar de Editais (PNCP + Webscraping)", included: true },
      { text: "Cofre de Identidade avançado", included: true },
      { text: "Busca automática diária", included: true },
      { text: "IA Orçamentária completa", included: true },
      { text: "Gestão & Compliance End-to-End", included: true },
    ],
  },
];

const Configuracoes = () => {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground mt-1">Gerencie seu perfil e assinatura</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" /> Perfil do Usuário
          </CardTitle>
          <CardDescription>Suas informações pessoais.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input defaultValue="Maria Silva" />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input defaultValue="maria@exemplo.com" type="email" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Cargo</Label>
            <Input defaultValue="Coordenadora de Projetos" />
          </div>
          <Button>
            <Save className="h-4 w-4 mr-2" /> Salvar Perfil
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" /> Planos
          </CardTitle>
          <CardDescription>Escolha o plano ideal para sua organização.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`p-5 rounded-xl border-2 transition-colors ${
                  plan.current
                    ? "border-primary/30 bg-primary/5"
                    : "border-accent/30 bg-accent/5 hover:border-accent"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {!plan.current && <Crown className="h-4 w-4 text-accent" />}
                    <h3 className="font-bold text-lg">{plan.name}</h3>
                  </div>
                  {plan.current && <Badge variant="secondary">Atual</Badge>}
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
                  className={`w-full mt-4 ${plan.current ? "" : "bg-accent hover:bg-accent/90 text-accent-foreground"}`}
                  variant={plan.current ? "outline" : "default"}
                  disabled={plan.current}
                >
                  {plan.current ? "Plano Atual" : "Fazer Upgrade"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Configuracoes;