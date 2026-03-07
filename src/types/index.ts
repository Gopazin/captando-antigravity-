export interface Organization {
  id: string;
  name: string;
  cnpj: string;
  location: string;
  mission: string;
  vision: string;
  previousProjects: PreviousProject[];
  teamMembers: TeamMember[];
  documents: DocumentMeta[];
  createdAt: string;
  updatedAt: string;
}

export interface PreviousProject {
  id: string;
  title: string;
  description: string;
  year: string;
  value: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
}

export interface DocumentMeta {
  id: string;
  name: string;
  type: 'estatuto' | 'ata' | 'cnpj' | 'outro';
  fileName: string;
  uploadedAt: string;
}

export interface Grant {
  id: string;
  title: string;
  organization: string;
  area: 'cultura' | 'esporte' | 'social' | 'educacao' | 'saude' | 'meio_ambiente';
  maxValue: number;
  deadline: string;
  eligibility: string;
  description: string;
  sourceUrl?: string;
  sourceFile?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  organizationId: string;
  grantId: string;
  status: 'rascunho' | 'em_revisao' | 'finalizado';
  briefing: string;
  generatedTitle: string;
  justification: string;
  objectives: string;
  methodology: string;
  currentStep: number;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = Project['status'];
export type GrantArea = Grant['area'];

export const AREA_LABELS: Record<GrantArea, string> = {
  cultura: 'Cultura',
  esporte: 'Esporte',
  social: 'Social',
  educacao: 'Educação',
  saude: 'Saúde',
  meio_ambiente: 'Meio Ambiente',
};

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  rascunho: 'Rascunho',
  em_revisao: 'Em Revisão',
  finalizado: 'Finalizado',
};
