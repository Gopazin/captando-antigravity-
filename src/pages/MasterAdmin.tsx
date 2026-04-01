import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Coins, Database, Activity, ShieldAlert, Cpu, Search, PlusCircle, MoreHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthProvider";
import { useNavigate } from "react-router-dom";

interface Organization {
  id: string;
  name: string;
  plan_type: string;
  credits_balance: number;
}

export default function MasterAdmin() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Redirect if not super admin
  useEffect(() => {
    if (role !== "super_admin") {
      navigate("/");
    }
  }, [role, navigate]);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      // @ts-expect-error - Ignoring type warning for custom table before type generation
      const { data, error } = await supabase.from("organizations").select("*").order("created_at", { ascending: false });
      if (!error && data) {
        setOrganizations(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrgs = organizations.filter(org => org.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (role !== "super_admin") return null;

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Super Admin Hub</h1>
        <p className="text-muted-foreground mt-1">Gestão global de Multitenancy, Inquilinos e Consumo de IA</p>
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
              <p className="text-2xl font-bold mt-1">
                {organizations.reduce((acc, org) => acc + (org.credits_balance || 0), 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl"><Coins className="h-5 w-5 text-primary" /></div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Assinantes PRO</p>
              <p className="text-2xl font-bold mt-1">
                {organizations.filter(o => o.plan_type === 'pro').length}
              </p>
            </div>
            <div className="p-3 bg-success/10 rounded-xl"><Activity className="h-5 w-5 text-success" /></div>
          </CardContent>
        </Card>
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-warning-foreground uppercase tracking-wide font-medium">Alertas de Uso</p>
              <p className="text-2xl font-bold mt-1 text-warning-foreground">0</p>
            </div>
            <div className="p-3 bg-warning/20 rounded-xl"><ShieldAlert className="h-5 w-5 text-warning-foreground" /></div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gestão de Organizações */}
        <Card className="lg:col-span-2 glass-card shadow-lg border-primary/10">
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
              <Input
                placeholder="Buscar por nome ou CNPJ..."
                className="pl-9 bg-background/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
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
                            {org.plan_type.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">{org.credits_balance?.toLocaleString()}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Custo e Configurações de IA */}
        <Card className="glass-card border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" /> Modelos de IA
            </CardTitle>
            <CardDescription>Roteamento e custos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Inteligência: Plano Free</label>
                <Select defaultValue="gpt-4o-mini">
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Selecione modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o-mini">OpenAI GPT-4o-Mini</SelectItem>
                    <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground">Foco: Custo-benefício e rapidez.</p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Inteligência: Plano Pro</label>
                <Select defaultValue="gpt-4o">
                  <SelectTrigger className="bg-background/50 border-accent/30">
                    <SelectValue placeholder="Selecione modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o">OpenAI GPT-4o</SelectItem>
                    <SelectItem value="claude-3-5-sonnet">Claude 3.5 Sonnet</SelectItem>
                    <SelectItem value="o1-mini">OpenAI o1-mini (Reasoning)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground">Foco: Alta qualidade semantíca.</p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="font-semibold text-sm mb-2">Monitor MCP</p>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Status do Endpoint</span>
                <span className="text-success font-medium flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse inline-block" /> Online</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Último Sync</span>
                <span>Há 5 minutos</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
