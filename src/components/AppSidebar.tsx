import {
  LayoutDashboard,
  Vault,
  Radar,
  Sparkles,
  ShieldCheck,
  Settings,
  FolderKanban,
  Crown,
  ChevronRight,
  Bot,
  Columns3,
  Eye,
  FileText,
  CalendarDays,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const simpleItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Radar de Editais", url: "/editais", icon: Radar, premium: true },
  { title: "Cofre de Identidade", url: "/cofre", icon: Vault },
];

const escritorioItems = [
  { title: "Assistente IA", url: "/escritorio/assistente", icon: Bot },
  { title: "Kanban", url: "/escritorio/kanban", icon: Columns3 },
];

const gestaoItems = [
  { title: "Visão Geral", url: "/gestao-projetos", icon: Eye },
  { title: "Cronograma", url: "/gestao-projetos/cronograma", icon: CalendarDays },
  { title: "Documentos", url: "/gestao-projetos/documentos", icon: FileText },
];

const bottomItems = [
  { title: "Gestão & Compliance", url: "/gestao", icon: ShieldCheck },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const escritorioOpen = location.pathname.startsWith("/escritorio");
  const gestaoProjetosOpen = location.pathname.startsWith("/gestao-projetos");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground font-bold text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            C
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-sidebar-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Captando
              </span>
              <span className="text-[10px] text-sidebar-foreground/50 leading-tight">
                Captação inteligente
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="flex flex-col justify-between flex-1">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-widest">
            Módulos
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Simple top items */}
              {simpleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && (
                        <span className="flex items-center gap-2">
                          {item.title}
                          {item.premium && (
                            <Crown className="h-3 w-3 text-accent" />
                          )}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Escritório de Projetos - Expandable */}
              <Collapsible defaultOpen={escritorioOpen} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip="Escritório de Projetos"
                      isActive={escritorioOpen}
                    >
                      <Sparkles className="h-4 w-4" />
                      {!collapsed && (
                        <>
                          <span className="flex-1">Escritório de Projetos</span>
                          <ChevronRight className="h-3.5 w-3.5 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        </>
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {escritorioItems.map((item) => (
                        <SidebarMenuSubItem key={item.title}>
                          <SidebarMenuSubButton asChild isActive={isActive(item.url)}>
                            <NavLink
                              to={item.url}
                              className="hover:bg-sidebar-accent/50"
                              activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                            >
                              <item.icon className="h-3.5 w-3.5" />
                              <span>{item.title}</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* Gestão de Projetos - Expandable */}
              <Collapsible defaultOpen={gestaoProjetosOpen} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip="Gestão de Projetos"
                      isActive={gestaoProjetosOpen}
                    >
                      <FolderKanban className="h-4 w-4" />
                      {!collapsed && (
                        <>
                          <span className="flex-1">Gestão de Projetos</span>
                          <ChevronRight className="h-3.5 w-3.5 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        </>
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {gestaoItems.map((item) => (
                        <SidebarMenuSubItem key={item.title}>
                          <SidebarMenuSubButton asChild isActive={isActive(item.url)}>
                            <NavLink
                              to={item.url}
                              end={item.url === "/gestao-projetos"}
                              className="hover:bg-sidebar-accent/50"
                              activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                            >
                              <item.icon className="h-3.5 w-3.5" />
                              <span>{item.title}</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        {!collapsed && (
          <div className="text-[9px] text-sidebar-foreground/30 leading-tight">
            © 2026 Captando. IA de ponta do edital à prestação de contas.
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
