import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExternalLink, Search, MapPin, X } from "lucide-react";
import { FONTES, CATEGORIAS, TIPOS, RECURSOS, ABRANGENCIAS, CATEGORIA_COLORS, type GrantSource } from "@/data/grantSources";

function FonteCard({ fonte }: { fonte: GrantSource }) {
  const catColor = CATEGORIA_COLORS[fonte.categoria] || "";
  return (
    <Card className="flex flex-col gap-3 p-5 hover:shadow-md hover:border-primary/30 transition-all duration-200">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-foreground text-sm leading-snug">{fonte.nome}</h3>
        <Badge variant="outline" className={catColor}>{fonte.categoria}</Badge>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{fonte.descricao}</p>
      <div className="flex flex-wrap gap-1.5">
        {fonte.tipo.filter(t => t !== "Todos").map((t) => (
          <Badge key={t} variant="secondary" className="text-xs font-normal">{t}</Badge>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {fonte.recurso.filter(r => r !== "Todos").map((r) => (
          <Badge key={r} variant="outline" className="text-xs font-normal bg-primary/5 text-primary border-primary/20">{r}</Badge>
        ))}
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <MapPin className="h-3 w-3" /> {fonte.abrangencia}
        </span>
        <a
          href={fonte.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-primary hover:underline transition-colors flex items-center gap-1"
        >
          Acessar fonte <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </Card>
  );
}

export default function GrantSourcesDirectory() {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("Todos");
  const [tipo, setTipo] = useState("Todos");
  const [recurso, setRecurso] = useState("Todos");
  const [abrangencia, setAbrangencia] = useState("Todos");

  const fontesFiltradas = useMemo(() => {
    return FONTES.filter((f) => {
      const matchBusca = busca === "" || f.nome.toLowerCase().includes(busca.toLowerCase()) || f.descricao.toLowerCase().includes(busca.toLowerCase());
      const matchCategoria = categoria === "Todos" || f.categoria === categoria;
      const matchTipo = tipo === "Todos" || f.tipo.includes(tipo);
      const matchRecurso = recurso === "Todos" || f.recurso.includes(recurso);
      const matchAbrangencia = abrangencia === "Todos" || f.abrangencia === abrangencia;
      return matchBusca && matchCategoria && matchTipo && matchRecurso && matchAbrangencia;
    });
  }, [busca, categoria, tipo, recurso, abrangencia]);

  const limparFiltros = () => {
    setBusca("");
    setCategoria("Todos");
    setTipo("Todos");
    setRecurso("Todos");
    setAbrangencia("Todos");
  };

  const temFiltros = busca || categoria !== "Todos" || tipo !== "Todos" || recurso !== "Todos" || abrangencia !== "Todos";

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou descrição..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Select value={categoria} onValueChange={setCategoria}>
            <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
            <SelectContent>
              {CATEGORIAS.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger><SelectValue placeholder="Área / Tipo" /></SelectTrigger>
            <SelectContent>
              {TIPOS.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={recurso} onValueChange={setRecurso}>
            <SelectTrigger><SelectValue placeholder="Tipo de Recurso" /></SelectTrigger>
            <SelectContent>
              {RECURSOS.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={abrangencia} onValueChange={setAbrangencia}>
            <SelectTrigger><SelectValue placeholder="Abrangência" /></SelectTrigger>
            <SelectContent>
              {ABRANGENCIAS.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{fontesFiltradas.length}</span> fontes encontradas de {FONTES.length} cadastradas
          </p>
          {temFiltros && (
            <Button variant="ghost" size="sm" onClick={limparFiltros} className="text-xs">
              <X className="h-3 w-3 mr-1" /> Limpar filtros
            </Button>
          )}
        </div>
      </div>

      {fontesFiltradas.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Nenhuma fonte encontrada</p>
          <p className="text-sm mt-1">Tente ajustar os filtros de busca.</p>
          <Button variant="link" onClick={limparFiltros} className="mt-2">Limpar filtros</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {fontesFiltradas.map((f) => (
            <FonteCard key={f.id} fonte={f} />
          ))}
        </div>
      )}
    </div>
  );
}
