import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Save, Plus, Trash2, Upload, FileText } from "lucide-react";
import { mockOrganization } from "@/data/mock";
import { Organization, PreviousProject, TeamMember, DocumentMeta } from "@/types";
import { useToast } from "@/hooks/use-toast";

const Cofre = () => {
  const { toast } = useToast();
  const [org, setOrg] = useState<Organization>(mockOrganization);

  const updateField = (field: keyof Organization, value: string) => {
    setOrg((prev) => ({ ...prev, [field]: value }));
  };

  const addProject = () => {
    const newProject: PreviousProject = { id: crypto.randomUUID(), title: "", description: "", year: new Date().getFullYear().toString(), value: "" };
    setOrg((prev) => ({ ...prev, previousProjects: [...prev.previousProjects, newProject] }));
  };

  const updateProject = (id: string, field: keyof PreviousProject, value: string) => {
    setOrg((prev) => ({ ...prev, previousProjects: prev.previousProjects.map((p) => (p.id === id ? { ...p, [field]: value } : p)) }));
  };

  const removeProject = (id: string) => {
    setOrg((prev) => ({ ...prev, previousProjects: prev.previousProjects.filter((p) => p.id !== id) }));
  };

  const addTeamMember = () => {
    const newMember: TeamMember = { id: crypto.randomUUID(), name: "", role: "", bio: "" };
    setOrg((prev) => ({ ...prev, teamMembers: [...prev.teamMembers, newMember] }));
  };

  const updateMember = (id: string, field: keyof TeamMember, value: string) => {
    setOrg((prev) => ({ ...prev, teamMembers: prev.teamMembers.map((m) => (m.id === id ? { ...m, [field]: value } : m)) }));
  };

  const removeMember = (id: string) => {
    setOrg((prev) => ({ ...prev, teamMembers: prev.teamMembers.filter((m) => m.id !== id) }));
  };

  const handleSave = () => {
    localStorage.setItem("projetofacil_org", JSON.stringify(org));
    toast({ title: "Dados salvos!", description: "As informações do cofre foram salvas com sucesso." });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cofre da Organização</h1>
          <p className="text-muted-foreground mt-1">Banco de dados fixo da sua entidade</p>
        </div>
        <Button onClick={handleSave} className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Save className="h-4 w-4 mr-2" /> Salvar
        </Button>
      </div>

      <Tabs defaultValue="basicos" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="basicos">Dados Básicos</TabsTrigger>
          <TabsTrigger value="tecnica">Capacidade Técnica</TabsTrigger>
          <TabsTrigger value="docs">Documentação</TabsTrigger>
        </TabsList>

        <TabsContent value="basicos">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Organização</CardTitle>
              <CardDescription>Dados de identificação e missão institucional.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Organização</Label>
                  <Input id="name" value={org.name} onChange={(e) => updateField("name", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input id="cnpj" value={org.cnpj} onChange={(e) => updateField("cnpj", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Localização</Label>
                <Input id="location" value={org.location} onChange={(e) => updateField("location", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mission">Missão</Label>
                <Textarea id="mission" value={org.mission} onChange={(e) => updateField("mission", e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vision">Visão</Label>
                <Textarea id="vision" value={org.vision} onChange={(e) => updateField("vision", e.target.value)} rows={3} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tecnica">
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Projetos Anteriores</CardTitle>
                  <CardDescription>Histórico de projetos já realizados.</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={addProject}>
                  <Plus className="h-4 w-4 mr-1" /> Adicionar
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {org.previousProjects.map((project) => (
                  <div key={project.id} className="p-4 border rounded-lg space-y-3 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Projeto</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeProject(project.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Input placeholder="Título" value={project.title} onChange={(e) => updateProject(project.id, "title", e.target.value)} />
                      <Input placeholder="Ano" value={project.year} onChange={(e) => updateProject(project.id, "year", e.target.value)} />
                      <Input placeholder="Valor (R$)" value={project.value} onChange={(e) => updateProject(project.id, "value", e.target.value)} />
                    </div>
                    <Textarea placeholder="Descrição" value={project.description} onChange={(e) => updateProject(project.id, "description", e.target.value)} rows={2} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Equipe Técnica</CardTitle>
                  <CardDescription>Membros da equipe e currículos simplificados.</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={addTeamMember}>
                  <Plus className="h-4 w-4 mr-1" /> Adicionar
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {org.teamMembers.map((member) => (
                  <div key={member.id} className="p-4 border rounded-lg space-y-3 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Membro</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeMember(member.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input placeholder="Nome" value={member.name} onChange={(e) => updateMember(member.id, "name", e.target.value)} />
                      <Input placeholder="Cargo/Função" value={member.role} onChange={(e) => updateMember(member.id, "role", e.target.value)} />
                    </div>
                    <Textarea placeholder="Mini currículo" value={member.bio} onChange={(e) => updateMember(member.id, "bio", e.target.value)} rows={2} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="docs">
          <Card>
            <CardHeader>
              <CardTitle>Documentação</CardTitle>
              <CardDescription>Upload de documentos da organização (Estatuto, Ata, Cartão CNPJ).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-accent/50 transition-colors cursor-pointer">
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-medium">Arraste arquivos aqui ou clique para upload</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, DOC até 10MB</p>
              </div>

              {org.documents.length > 0 && (
                <div className="space-y-2">
                  <Label>Documentos Carregados</Label>
                  {org.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.fileName}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{doc.type}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Cofre;
