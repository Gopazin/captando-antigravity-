import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, ExternalLink, Calendar, DollarSign, ShieldCheck, Upload, Link } from "lucide-react";
import { mockGrants } from "@/data/mock";
import { Grant, AREA_LABELS, GrantArea } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const areaColors: Record<GrantArea, string> = {
  cultura: "bg-purple-100 text-purple-700 border-purple-200",
  esporte: "bg-blue-100 text-blue-700 border-blue-200",
  social: "bg-rose-100 text-rose-700 border-rose-200",
  educacao: "bg-amber-100 text-amber-700 border-amber-200",
  saude: "bg-green-100 text-green-700 border-green-200",
  meio_ambiente: "bg-teal-100 text-teal-700 border-teal-200",
};

const Editais = () => {
  const [grants] = useState<Grant[]>(mockGrants);
  const [search, setSearch] = useState("");
  const [areaFilter, setAreaFilter] = useState<string>("all");
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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
          <p className="text-muted-foreground mt-1">Editais capturados e disponíveis para projetos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Plus className="h-4 w-4 mr-2" /> Novo Edital
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Edital</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="url" className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="url"><Link className="h-4 w-4 mr-1" /> URL</TabsTrigger>
                <TabsTrigger value="pdf"><Upload className="h-4 w-4 mr-1" /> Upload PDF</TabsTrigger>
              </TabsList>
              <TabsContent value="url" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>URL do Edital</Label>
                  <Input placeholder="https://exemplo.gov.br/edital..." />
                </div>
                <p className="text-xs text-muted-foreground">A IA irá analisar e extrair os dados automaticamente.</p>
              </TabsContent>
              <TabsContent value="pdf" className="space-y-4 mt-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-accent/50 transition-colors">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Arraste o PDF ou clique para upload</p>
                  <p className="text-xs text-muted-foreground mt-1">Até 20MB</p>
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button className="bg-primary" onClick={() => setDialogOpen(false)}>Processar com IA</Button>
            </DialogFooter>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Edital</TableHead>
                <TableHead>Área</TableHead>
                <TableHead>Valor Máximo</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((grant) => {
                const daysLeft = Math.ceil((new Date(grant.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return (
                  <TableRow key={grant.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedGrant(grant)}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{grant.title}</p>
                        <p className="text-sm text-muted-foreground">{grant.organization}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={areaColors[grant.area]}>{AREA_LABELS[grant.area]}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">R$ {grant.maxValue.toLocaleString("pt-BR")}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{new Date(grant.deadline).toLocaleDateString("pt-BR")}</span>
                        {daysLeft <= 15 && <Badge variant="destructive" className="text-xs">{daysLeft}d</Badge>}
                      </div>
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
                  <Badge variant="outline" className={areaColors[selectedGrant.area]}>{AREA_LABELS[selectedGrant.area]}</Badge>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <ShieldCheck className="h-5 w-5 text-accent mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Elegibilidade</p>
                      <p className="text-sm text-muted-foreground mt-1">{selectedGrant.eligibility}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <DollarSign className="h-5 w-5 text-accent mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Teto de Valor</p>
                      <p className="text-sm text-muted-foreground mt-1">R$ {selectedGrant.maxValue.toLocaleString("pt-BR")}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <Calendar className="h-5 w-5 text-accent mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Data Limite</p>
                      <p className="text-sm text-muted-foreground mt-1">{new Date(selectedGrant.deadline).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Descrição</p>
                  <p className="text-sm text-muted-foreground">{selectedGrant.description}</p>
                </div>

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
