export interface GrantSource {
  id: number;
  nome: string;
  url: string;
  categoria: string;
  tipo: string[];
  abrangencia: string;
  recurso: string[];
  descricao: string;
  ativo: boolean;
}

export const FONTES: GrantSource[] = [
  { id: 1, nome: "Prosas", url: "https://www.prosas.com.br/apps/editais", categoria: "Agregador", tipo: ["Cultura", "Social", "Pesquisa", "Inovação"], abrangencia: "Nacional", recurso: ["Fundo Perdido", "Patrocínio", "Subvenção"], descricao: "Plataforma que agrega editais públicos e privados de diversas áreas.", ativo: true },
  { id: 2, nome: "Capta.org.br", url: "https://www.capta.org.br/fontes-de-financiamento/oportunidades", categoria: "Agregador", tipo: ["Cultura", "Social", "Meio Ambiente", "Educação"], abrangencia: "Nacional", recurso: ["Fundo Perdido", "Financiamento"], descricao: "Editais abertos com prazos, valores e perfil do beneficiário.", ativo: true },
  { id: 3, nome: "EditalFomento.com.br", url: "https://www.editalfomento.com.br", categoria: "Agregador", tipo: ["Cultura", "Esporte", "Social", "Pesquisa"], abrangencia: "Nacional", recurso: ["Fundo Perdido", "Patrocínio"], descricao: "Atualizado automaticamente, permite busca por palavras-chave e área.", ativo: true },
  { id: 4, nome: "EditaisCulturais.com.br", url: "https://www.editaisculturais.com.br", categoria: "Agregador", tipo: ["Cultura"], abrangencia: "Nacional", recurso: ["Fundo Perdido", "Lei de Incentivo"], descricao: "Foco em editais culturais e leis de incentivo à cultura.", ativo: true },
  { id: 5, nome: "Idealist.org", url: "https://www.idealist.org/pt", categoria: "Agregador", tipo: ["Social", "Educação", "Meio Ambiente"], abrangencia: "Internacional", recurso: ["Subvenção", "Fundo Perdido"], descricao: "Oportunidades de financiamento, emprego e voluntariado para ONGs.", ativo: true },
  { id: 6, nome: "Ministério da Cultura – Editais", url: "https://www.gov.br/cultura/pt-br/assuntos/editais", categoria: "Governo Federal", tipo: ["Cultura"], abrangencia: "Nacional", recurso: ["Fundo Perdido", "Lei de Incentivo"], descricao: "Portal oficial com editais abertos do Ministério da Cultura.", ativo: true },
  { id: 7, nome: "FINEP", url: "https://www.finep.gov.br", categoria: "Governo Federal", tipo: ["Inovação", "Pesquisa", "Tecnologia"], abrangencia: "Nacional", recurso: ["Subvenção Econômica", "Fundo Perdido", "Financiamento"], descricao: "Subvenção econômica e fundo perdido para inovação, tecnologia e P&D.", ativo: true },
  { id: 8, nome: "BNDES", url: "https://www.bndes.gov.br", categoria: "Governo Federal", tipo: ["Inovação", "Social", "Meio Ambiente", "Cultura"], abrangencia: "Nacional", recurso: ["Financiamento", "Fundo Perdido"], descricao: "Financiamentos e fundo perdido via FUNTEC e programas socioambientais.", ativo: true },
  { id: 9, nome: "CNPq", url: "https://www.gov.br/cnpq/pt-br", categoria: "Governo Federal", tipo: ["Pesquisa", "Ciência"], abrangencia: "Nacional", recurso: ["Bolsa", "Fundo Perdido"], descricao: "Editais para pesquisa científica e tecnológica, bolsas e auxílios.", ativo: true },
  { id: 10, nome: "SEBRAE – Editais", url: "https://www.sebrae.com.br", categoria: "Governo Federal", tipo: ["Empreendedorismo", "Inovação"], abrangencia: "Nacional", recurso: ["Subvenção", "Fundo Perdido"], descricao: "Editais para micro e pequenas empresas e startups.", ativo: true },
  { id: 11, nome: "Ministério do Esporte", url: "https://www.gov.br/esporte/pt-br", categoria: "Governo Federal", tipo: ["Esporte"], abrangencia: "Nacional", recurso: ["Lei de Incentivo", "Fundo Perdido"], descricao: "Lei Federal de Incentivo ao Esporte e editais de fomento esportivo.", ativo: true },
  { id: 12, nome: "Diário Oficial da União", url: "https://www.in.gov.br", categoria: "Governo Federal", tipo: ["Todos"], abrangencia: "Nacional", recurso: ["Todos"], descricao: "Publicação oficial de todos os editais e convênios do governo federal.", ativo: true },
  { id: 13, nome: "TransfereGov (SICONV)", url: "https://transferegov.sistema.gov.br", categoria: "Governo Federal", tipo: ["Social", "Educação", "Saúde", "Infraestrutura"], abrangencia: "Nacional", recurso: ["Convênio", "Repasse Federal"], descricao: "Plataforma de convênios, emendas parlamentares e repasses federais.", ativo: true },
  { id: 14, nome: "FAPESP", url: "https://www.fapesp.br", categoria: "FAP Estadual", tipo: ["Pesquisa", "Ciência", "Inovação"], abrangencia: "São Paulo", recurso: ["Bolsa", "Auxílio", "Fundo Perdido"], descricao: "Fundação de Amparo à Pesquisa do Estado de São Paulo.", ativo: true },
  { id: 15, nome: "FAPERJ", url: "https://www.faperj.br", categoria: "FAP Estadual", tipo: ["Pesquisa", "Ciência"], abrangencia: "Rio de Janeiro", recurso: ["Bolsa", "Auxílio", "Fundo Perdido"], descricao: "Fundação Carlos Chagas Filho de Amparo à Pesquisa do RJ.", ativo: true },
  { id: 16, nome: "FAPEMIG", url: "https://www.fapemig.br", categoria: "FAP Estadual", tipo: ["Pesquisa", "Ciência"], abrangencia: "Minas Gerais", recurso: ["Bolsa", "Auxílio", "Fundo Perdido"], descricao: "Fundação de Amparo à Pesquisa do Estado de Minas Gerais.", ativo: true },
  { id: 17, nome: "FAPERGS", url: "https://www.fapergs.rs.gov.br", categoria: "FAP Estadual", tipo: ["Pesquisa", "Ciência"], abrangencia: "Rio Grande do Sul", recurso: ["Bolsa", "Auxílio", "Fundo Perdido"], descricao: "Fundação de Amparo à Pesquisa do Estado do RS.", ativo: true },
  { id: 18, nome: "CONFAP", url: "https://www.confap.org.br", categoria: "FAP Estadual", tipo: ["Pesquisa", "Ciência"], abrangencia: "Nacional", recurso: ["Bolsa", "Fundo Perdido"], descricao: "Conselho Nacional das FAPs – acesso a todas as fundações estaduais.", ativo: true },
  { id: 19, nome: "ProAC – São Paulo", url: "https://www.cultura.sp.gov.br/proac", categoria: "Cultura Estadual", tipo: ["Cultura"], abrangencia: "São Paulo", recurso: ["Fundo Perdido", "Lei de Incentivo"], descricao: "Programa de Ação Cultural do Estado de São Paulo.", ativo: true },
  { id: 20, nome: "Secult CE – Portal de Editais", url: "https://editais.cultura.ce.gov.br", categoria: "Cultura Estadual", tipo: ["Cultura"], abrangencia: "Ceará", recurso: ["Fundo Perdido"], descricao: "Portal dedicado exclusivamente aos editais culturais do Ceará.", ativo: true },
  { id: 21, nome: "Instituto Cultural Vale", url: "https://www.institutoculturalvale.org", categoria: "Instituto Privado", tipo: ["Cultura", "Esporte"], abrangencia: "Nacional", recurso: ["Patrocínio", "Lei de Incentivo"], descricao: "Editais de cultura e esporte via Leis de Incentivo (Rouanet, PIE).", ativo: true },
  { id: 22, nome: "Petrobras – Editais", url: "https://petrobras.com.br/editais", categoria: "Instituto Privado", tipo: ["Cultura", "Esporte", "Social", "Meio Ambiente"], abrangencia: "Nacional", recurso: ["Patrocínio", "Fundo Perdido"], descricao: "Editais de patrocínio via leis de incentivo e programas socioambientais.", ativo: true },
  { id: 23, nome: "Itaú Cultural", url: "https://www.itaucultural.org.br", categoria: "Instituto Privado", tipo: ["Cultura"], abrangencia: "Nacional", recurso: ["Patrocínio", "Fundo Perdido"], descricao: "Programas de fomento à cultura brasileira, artes visuais e pensamento.", ativo: true },
  { id: 24, nome: "Fundação Bradesco", url: "https://www.fundacao.bradesco", categoria: "Instituto Privado", tipo: ["Educação"], abrangencia: "Nacional", recurso: ["Patrocínio", "Subvenção"], descricao: "Programas educacionais e de capacitação profissional.", ativo: true },
  { id: 25, nome: "Instituto Unibanco", url: "https://www.institutounibanco.org.br", categoria: "Instituto Privado", tipo: ["Educação"], abrangencia: "Nacional", recurso: ["Subvenção", "Fundo Perdido"], descricao: "Fomento à educação pública de qualidade no ensino médio.", ativo: true },
  { id: 26, nome: "Fundação Grupo Boticário", url: "https://www.fundacaogrupoboticario.org.br", categoria: "Instituto Privado", tipo: ["Meio Ambiente"], abrangencia: "Nacional", recurso: ["Fundo Perdido"], descricao: "Editais de conservação da natureza e biodiversidade.", ativo: true },
  { id: 27, nome: "The Awesome Foundation", url: "https://www.awesomefoundation.org", categoria: "Internacional", tipo: ["Inovação", "Social", "Cultura"], abrangencia: "Internacional", recurso: ["Fundo Perdido"], descricao: "Micro-grants de US$1.000/mês para projetos inovadores e criativos.", ativo: true },
  { id: 28, nome: "National Geographic Grants", url: "https://grants.nationalgeographic.org", categoria: "Internacional", tipo: ["Pesquisa", "Meio Ambiente", "Ciência"], abrangencia: "Internacional", recurso: ["Fundo Perdido", "Subvenção"], descricao: "Financiamento para exploração científica, conservação e storytelling.", ativo: true },
  { id: 29, nome: "MacArthur Foundation", url: "https://www.macfound.org", categoria: "Internacional", tipo: ["Social", "Meio Ambiente", "Pesquisa"], abrangencia: "Internacional", recurso: ["Fundo Perdido", "Subvenção"], descricao: "Grants para organizações que promovem justiça social e sustentabilidade.", ativo: true },
  { id: 30, nome: "EURAXESS – Oportunidades", url: "https://euraxess.ec.europa.eu", categoria: "Internacional", tipo: ["Pesquisa", "Ciência"], abrangencia: "Internacional", recurso: ["Bolsa", "Financiamento"], descricao: "Portal europeu de mobilidade e oportunidades para pesquisadores.", ativo: true },
  { id: 31, nome: "MCTI – Ministério da Ciência e Tecnologia", url: "https://www.gov.br/mcti/pt-br", categoria: "Governo Federal", tipo: ["Tecnologia", "Inovação", "Ciência"], abrangencia: "Nacional", recurso: ["Fundo Perdido", "Subvenção"], descricao: "Editais de fomento a projetos de ciência, tecnologia e inovação do governo federal.", ativo: true },
  { id: 32, nome: "Embrapii", url: "https://embrapii.org.br", categoria: "Governo Federal", tipo: ["Tecnologia", "Inovação", "Pesquisa"], abrangencia: "Nacional", recurso: ["Subvenção", "Fundo Perdido"], descricao: "Empresa Brasileira de Pesquisa e Inovação Industrial – projetos de P&D com empresas.", ativo: true },
  { id: 33, nome: "InovAtiva Brasil", url: "https://www.inovativabrasil.com.br", categoria: "Governo Federal", tipo: ["Tecnologia", "Empreendedorismo", "Inovação"], abrangencia: "Nacional", recurso: ["Aceleração", "Subvenção"], descricao: "Programa de aceleração de startups com foco em tecnologia e inovação.", ativo: true },
  { id: 34, nome: "Google.org", url: "https://www.google.org", categoria: "Internacional", tipo: ["Tecnologia", "Educação", "Social"], abrangencia: "Internacional", recurso: ["Fundo Perdido", "Subvenção"], descricao: "Grants para organizações que usam tecnologia para resolver desafios sociais.", ativo: true },
  { id: 35, nome: "Mozilla Foundation", url: "https://foundation.mozilla.org", categoria: "Internacional", tipo: ["Tecnologia", "Educação"], abrangencia: "Internacional", recurso: ["Fundo Perdido"], descricao: "Financiamento para projetos de internet aberta, privacidade e inclusão digital.", ativo: true },
];

export const CATEGORIAS = ["Todos", ...Array.from(new Set(FONTES.map((f) => f.categoria)))];
export const TIPOS = ["Todos", ...Array.from(new Set(FONTES.flatMap((f) => f.tipo))).filter(t => t !== "Todos")];
export const RECURSOS = ["Todos", ...Array.from(new Set(FONTES.flatMap((f) => f.recurso))).filter(r => r !== "Todos")];
export const ABRANGENCIAS = ["Todos", ...Array.from(new Set(FONTES.map((f) => f.abrangencia)))];

export const CATEGORIA_COLORS: Record<string, string> = {
  "Agregador": "bg-violet-100 text-violet-800 border-violet-200",
  "Governo Federal": "bg-blue-100 text-blue-800 border-blue-200",
  "FAP Estadual": "bg-cyan-100 text-cyan-800 border-cyan-200",
  "Cultura Estadual": "bg-amber-100 text-amber-800 border-amber-200",
  "Instituto Privado": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Internacional": "bg-rose-100 text-rose-800 border-rose-200",
};
