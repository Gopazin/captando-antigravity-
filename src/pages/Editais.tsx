import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, ExternalLink, Calendar, DollarSign, ShieldCheck, Upload, Link, RefreshCw, Loader2, Globe, FileText, BookOpen } from "lucide-react";
import { AREA_LABELS, GrantArea } from "@/types";
import GrantSourcesDirectory from "@/components/GrantSourcesDirectory";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const areaColors: Record<GrantArea, string> = {
  cultura: "bg-purple-100 text-purple-700 border-purple-200",
  esporte: "bg-blue-100 text-blue-700 border-blue-200",
  social: "bg-rose-100 text-rose-700 border-rose-200",
  educacao: "bg-amber-100 text-amber-700 border-amber-200",
  saude: "bg-green-100 text-green-700 border-green-200",
  meio_ambiente: "bg-teal-100 text-teal-700 border-teal-200",
};

const sourceTypeLabels: Record<string, string> = {
  manual: "Manual",
  url: "URL",
  pdf: "PDF",
  auto_search: "Busca Automática",
};

interface DbGrant {
  id: string;
  title: string;
  organization: string;
  area: string;
  max_value: number;
  deadline: string | null;
  eligibility: string;
  description: string;
  source_url: string | null;
  source_type: string;
  is_active: boolean;
  created_at: string;
}

const Editais = () => {
  const [grants, setGrants] = useState<DbGrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [areaFilter, setAreaFilter] = useState<string>("all");
  const [selectedGrant, setSelectedGrant] = useState<DbGrant | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form states
  const [urlInput, setUrlInput] = useState("");
  const [pdfText, setPdfText] = useState("");
  const [manualForm, setManualForm] = useState({
    title: "", organization: "", area: "social", max_value: "",
    deadline: "", eligibility: "", description: "", source_url: "",
  });

  const fetchGrants = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("grants")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching grants:", error);
      toast.error("Erro ao carregar editais");
    } else {
      setGrants((data as DbGrant[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGrants();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("grants-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "grants" }, () => {
        fetchGrants();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleAutoSearch = async () => {
    setIsSearching(true);
    toast.info("Buscando editais em fontes governamentais e especializadas...");
    try {
      const { data, error } = await supabase.functions.invoke("search-grants", {
        body: { areas: ["cultura", "esporte", "social", "educacao", "saude", "meio_ambiente"] },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(`Busca concluída! ${data.found} encontrados, ${data.inserted} novos adicionados.`);
      fetchGrants();
    } catch (err) {
      console.error("Search error:", err);
      toast.error("Erro na busca automática. Tente novamente.");
    }
    setIsSearching(false);
  };

  const handleProcessUrl = async () => {
    if (!urlInput.trim()) return;
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("parse-grant", {
        body: { url: urlInput.trim() },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success("Edital processado e salvo com sucesso!");
      setUrlInput("");
      setDialogOpen(false);
      fetchGrants();
    } catch (err) {
      console.error("URL parse error:", err);
      toast.error("Erro ao processar URL. Tente novamente.");
    }
    setIsProcessing(false);
  };

  const handleProcessPdf = async () => {
    if (!pdfText.trim()) return;
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("parse-grant", {
        body: { pdfText: pdfText.trim() },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success("Edital processado e salvo com sucesso!");
      setPdfText("");
      setDialogOpen(false);
      fetchGrants();
    } catch (err) {
      console.error("PDF parse error:", err);
      toast.error("Erro ao processar PDF. Tente novamente.");
    }
    setIsProcessing(false);
  };

  const handleManualSave = async () => {
    if (!manualForm.title.trim() || !manualForm.organization.trim()) {
      toast.error("Preencha pelo menos título e organização");
      return;
    }
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("parse-grant", {
        body: {
          manualData: {
            ...manualForm,
            max_value: manualForm.max_value ? Number(manualForm.max_value) : 0,
          },
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success("Edital salvo com sucesso!");
      setManualForm({ title: "", organization: "", area: "social", max_value: "", deadline: "", eligibility: "", description: "", source_url: "" });
      setDialogOpen(false);
      fetchGrants();
    } catch (err) {
      console.error("Manual save error:", err);
      toast.error("Erro ao salvar edital.");
    }
    setIsProcessing(false);
  };

  const filtered = grants.filter((g) => {
    const matchSearch = g.title.toLowerCase().includes(search.toLowerCase()) || g.organization.toLowerCase().includes(search.toLowerCase());
    const matchArea = areaFilter === "all" || g.area === areaFilter;
    return matchSearch && matchArea;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Banco de Editais</h1>
          <p className="text-muted-foreground mt-1">Editais capturados e fontes de financiamento mapeadas</p>
        </div>
      </div>

      <Tabs defaultValue="editais" className="space-y-6">
        <TabsList>
          <TabsTrigger value="editais"><Globe className="h-4 w-4 mr-2" />Editais Capturados</TabsTrigger>
          <TabsTrigger value="fontes"><BookOpen className="h-4 w-4 mr-2" />Fontes de Editais</TabsTrigger>
        </TabsList>

        <TabsContent value="editais" className="space-y-4">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleAutoSearch} disabled={isSearching}>
              {isSearching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Globe className="h-4 w-4 mr-2" />}
              {isSearching ? "Buscando..." : "Buscar Editais"}
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Plus className="h-4 w-4 mr-2" /> Novo Edital
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Adicionar Edital</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="url" className="mt-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="url"><Link className="h-4 w-4 mr-1" /> URL</TabsTrigger>
                    <TabsTrigger value="pdf"><Upload className="h-4 w-4 mr-1" /> Texto PDF</TabsTrigger>
                    <TabsTrigger value="manual"><FileText className="h-4 w-4 mr-1" /> Manual</TabsTrigger>
                  </TabsList>
                  <TabsContent value="url" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>URL do Edital</Label>
                      <Input placeholder="https://exemplo.gov.br/edital..." value={urlInput} onChange={(e) => setUrlInput(e.target.value)} />
                    </div>
                    <p className="text-xs text-muted-foreground">A IA irá acessar a página e extrair os dados automaticamente.</p>
                    <Button className="w-full" onClick={handleProcessUrl} disabled={isProcessing || !urlInput.trim()}>
                      {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                      Processar com IA
                    </Button>
                  </TabsContent>
                  <TabsContent value="pdf" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Cole o texto extraído do PDF</Label>
                      <Textarea rows={8} placeholder="Cole aqui o conteúdo do edital em PDF..." value={pdfText} onChange={(e) => setPdfText(e.target.value)} />
                    </div>
                    <p className="text-xs text-muted-foreground">Cole o texto do edital e a IA extrairá os dados estruturados.</p>
                    <Button className="w-full" onClick={handleProcessPdf} disabled={isProcessing || !pdfText.trim()}>
                      {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                      Processar com IA
                    </Button>
                  </TabsContent>
                  <TabsContent value="manual" className="space-y-3 mt-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2 space-y-1">
                        <Label>Título *</Label>
                        <Input value={manualForm.title} onChange={(e) => setManualForm(p => ({ ...p, title: e.target.value }))} />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label>Organização *</Label>
                        <Input value={manualForm.organization} onChange={(e) => setManualForm(p => ({ ...p, organization: e.target.value }))} />
                      </div>
                      <div className="space-y-1">
                        <Label>Área</Label>
                        <Select value={manualForm.area} onValueChange={(v) => setManualForm(p => ({ ...p, area: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Object.entries(AREA_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label>Valor Máximo (R$)</Label>
                        <Input type="number" value={manualForm.max_value} onChange={(e) => setManualForm(p => ({ ...p, max_value: e.target.value }))} />
                      </div>
                      <div className="space-y-1">
                        <Label>Prazo</Label>
                        <Input type="date" value={manualForm.deadline} onChange={(e) => setManualForm(p => ({ ...p, deadline: e.target.value }))} />
                      </div>
                      <div className="space-y-1">
                        <Label>URL (opcional)</Label>
                        <Input value={manualForm.source_url} onChange={(e) => setManualForm(p => ({ ...p, source_url: e.target.value }))} />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label>Elegibilidade</Label>
                        <Textarea rows={2} value={manualForm.eligibility} onChange={(e) => setManualForm(p => ({ ...p, eligibility: e.target.value }))} />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label>Descrição</Label>
                        <Textarea rows={3} value={manualForm.description} onChange={(e) => setManualForm(p => ({ ...p, description: e.target.value }))} />
                      </div>
                    </div>
                    <Button className="w-full" onClick={handleManualSave} disabled={isProcessing}>
                      {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                      Salvar Edital
                    </Button>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar editais..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={areaFilter} onValueChange={setAreaFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por área" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as áreas</SelectItem>
                {Object.entries(AREA_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Globe className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium">Nenhum edital encontrado</p>
              <p className="text-sm mt-1">Clique em "Buscar Editais" para buscar automaticamente ou adicione manualmente.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Edital</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead>Valor Máximo</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead>Fonte</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((grant) => {
                  const daysLeft = grant.deadline ? Math.ceil((new Date(grant.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
                  return (
                    <TableRow key={grant.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedGrant(grant)}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{grant.title}</p>
                          <p className="text-sm text-muted-foreground">{grant.organization}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={areaColors[grant.area as GrantArea] || ""}>
                          {AREA_LABELS[grant.area as GrantArea] || grant.area}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {grant.max_value ? `R$ ${Number(grant.max_value).toLocaleString("pt-BR")}` : "—"}
                      </TableCell>
                      <TableCell>
                        {grant.deadline ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{new Date(grant.deadline).toLocaleDateString("pt-BR")}</span>
                            {daysLeft !== null && daysLeft <= 15 && daysLeft > 0 && (
                              <Badge variant="destructive" className="text-xs">{daysLeft}d</Badge>
                            )}
                            {daysLeft !== null && daysLeft <= 0 && (
                              <Badge variant="secondary" className="text-xs">Encerrado</Badge>
                            )}
                          </div>
                        ) : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {sourceTypeLabels[grant.source_type] || grant.source_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedGrant(grant); }}>
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Sheet open={!!selectedGrant} onOpenChange={(open) => !open && setSelectedGrant(null)}>
        <SheetContent className="sm:max-w-lg">
          {selectedGrant && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedGrant.title}</SheetTitle>
                <SheetDescription>{selectedGrant.organization}</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={areaColors[selectedGrant.area as GrantArea] || ""}>
                    {AREA_LABELS[selectedGrant.area as GrantArea] || selectedGrant.area}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {sourceTypeLabels[selectedGrant.source_type] || selectedGrant.source_type}
                  </Badge>
                </div>
                <div className="space-y-4">
                  {selectedGrant.eligibility && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <ShieldCheck className="h-5 w-5 text-accent mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Elegibilidade</p>
                        <p className="text-sm text-muted-foreground mt-1">{selectedGrant.eligibility}</p>
                      </div>
                    </div>
                  )}
                  {selectedGrant.max_value > 0 && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <DollarSign className="h-5 w-5 text-accent mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Teto de Valor</p>
                        <p className="text-sm text-muted-foreground mt-1">R$ {Number(selectedGrant.max_value).toLocaleString("pt-BR")}</p>
                      </div>
                    </div>
                  )}
                  {selectedGrant.deadline && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <Calendar className="h-5 w-5 text-accent mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Data Limite</p>
                        <p className="text-sm text-muted-foreground mt-1">{new Date(selectedGrant.deadline).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}</p>
                      </div>
                    </div>
                  )}
                </div>
                {selectedGrant.description && (
                  <div>
                    <p className="text-sm font-medium mb-2">Descrição</p>
                    <p className="text-sm text-muted-foreground">{selectedGrant.description}</p>
                  </div>
                )}
                {selectedGrant.source_url && (
                  <a href={selectedGrant.source_url} target="_blank" rel="noopener noreferrer" className="text-sm text-accent underline flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" /> Ver edital original
                  </a>
                )}
                <Button className="w-full bg-primary" onClick={() => setSelectedGrant(null)}>
                  Criar Projeto com este Edital
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Editais;
