import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, CreditCard, Save } from "lucide-react";

const Configuracoes = () => {
  return (
    <div className="space-y-6 max-w-2xl">
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
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Save className="h-4 w-4 mr-2" /> Salvar Perfil
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" /> Assinatura
          </CardTitle>
          <CardDescription>Detalhes do seu plano atual.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Plano Gratuito</p>
              <p className="text-sm text-muted-foreground">3 projetos · 5 editais</p>
            </div>
            <Badge variant="secondary">Atual</Badge>
          </div>
          <Button variant="outline" className="w-full">Fazer Upgrade</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Configuracoes;
