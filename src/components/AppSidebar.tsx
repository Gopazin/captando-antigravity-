import { useState } from "react";
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
  ServerCog,
  CalendarDays,
  LogOut,
  ChevronUp,
  MessageCircle,
  HeartHandshake
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { NavLink } from "@/components/NavLink";
import { FeedbackModal } from "@/components/FeedbackModal";
import { ContactModal } from "@/components/ContactModal";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthProvider";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const simpleItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
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
  { title: "Gestão & Compliance", url: "/gestao", icon: ShieldCheck },
];

const bottomItems = [
  { title: "Falar com Suporte", type: "contact", icon: MessageCircle },
  { title: "Feedback & IA", type: "feedback", icon: HeartHandshake },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { user, organization, role, signOut } = useAuth();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  
  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const escritorioOpen = location.pathname.startsWith("/escritorio");
  const gestaoProjetosOpen = location.pathname.startsWith("/gestao-projetos");

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuário";

  return (
    <>
    <Sidebar collapsible="icon" className="border-r border-sidebar-border/50">
      <SidebarHeader className="h-16 flex items-center px-4 border-b border-sidebar-border/20 bg-sidebar/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Logo variant="iconOnly" iconSize={28} />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-tight text-sidebar-foreground uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Captando
              </span>
              <span className="text-[9px] text-accent font-bold uppercase tracking-[0.2em] leading-tight opacity-90">
                {organization?.plan_type || "Free"} Access
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="flex flex-col justify-between flex-1 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-sidebar-foreground/30 text-[10px] font-bold uppercase tracking-widest mb-2">
            Módulos
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-2 gap-1">
              {/* Simple top items */}
              {simpleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                    className="h-10 rounded-lg transition-all"
                  >
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 px-3 w-full group/link"
                      activeClassName="bg-accent/10 text-accent font-bold shadow-sm shadow-accent/5 ring-1 ring-accent/20"
                    >
                      <item.icon className="h-4 w-4 shrink-0 group-hover/link:text-accent transition-colors" />
                      {!collapsed && (
                        <span className="flex items-center justify-between flex-1">
                          {item.title}
                          {item.premium && (
                            <Crown className="h-3 w-3 text-accent fill-accent/20" />
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
                      className="h-10 rounded-lg px-3"
                    >
                      <Sparkles className="h-4 w-4 shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 ml-3 text-sm">Escritório</span>
                          <ChevronRight className="h-3.5 w-3.5 opacity-40 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        </>
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="ml-4 border-l border-sidebar-border/30 mt-1 pb-1">
                      {escritorioItems.map((item) => (
                        <SidebarMenuSubItem key={item.title}>
                          <SidebarMenuSubButton asChild isActive={isActive(item.url)} className="h-8">
                            <NavLink
                              to={item.url}
                              className="px-3 hover:text-accent transition-colors"
                              activeClassName="text-accent font-medium"
                            >
                              <item.icon className="h-3.5 w-3.5 mr-2 opacity-70" />
                              <span className="text-xs">{item.title}</span>
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
                      className="h-10 rounded-lg px-3"
                    >
                      <FolderKanban className="h-4 w-4 shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 ml-3 text-sm">Gestão</span>
                          <ChevronRight className="h-3.5 w-3.5 opacity-40 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        </>
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="ml-4 border-l border-sidebar-border/30 mt-1 pb-1">
                      {gestaoItems.map((item) => (
                        <SidebarMenuSubItem key={item.title}>
                          <SidebarMenuSubButton asChild isActive={isActive(item.url)} className="h-8">
                            <NavLink
                              to={item.url}
                              end={item.url === "/gestao-projetos"}
                              className="px-3 hover:text-accent transition-colors"
                              activeClassName="text-accent font-medium"
                            >
                              <item.icon className="h-3.5 w-3.5 mr-2 opacity-70" />
                              <span className="text-xs">{item.title}</span>
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

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel className="px-4 text-sidebar-foreground/30 text-[10px] font-bold uppercase tracking-widest mb-2">
            Apoio & Ajustes
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-2 gap-1">
              {bottomItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => {
                      if (item.type === "feedback") setFeedbackOpen(true);
                      if (item.type === "contact") setContactOpen(true);
                    }}
                    tooltip={item.title}
                    className="h-10 rounded-lg group"
                  >
                    <div className="flex items-center gap-3 px-3 w-full group-hover:text-accent transition-colors">
                      <item.icon className="h-4 w-4 shrink-0 opacity-70 group-hover:text-accent" />
                      {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Super Admin Conditional Item */}
              {role === "super_admin" && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/plataforma")}
                    tooltip="Gestão da Plataforma"
                    className="h-10 rounded-lg group"
                  >
                    <NavLink
                      to="/plataforma"
                      className="flex items-center gap-3 px-3 w-full"
                      activeClassName="bg-warning/10 text-warning font-semibold border-warning/10 border"
                    >
                      <ServerCog className="h-4 w-4 text-warning shrink-0 group-hover:rotate-45 transition-transform" />
                      {!collapsed && <span className="text-warning font-medium">Painel da Plataforma</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/30 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-12 hover:bg-accent/5 rounded-lg transition-colors group">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent text-xs font-bold group-hover:ring-2 group-hover:ring-accent/20 transition-all">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  {!collapsed && (
                    <div className="flex flex-col items-start ml-2 flex-1 overflow-hidden">
                      <span className="text-xs font-bold truncate w-full">{name}</span>
                      <span className="text-[10px] text-sidebar-foreground/40 truncate w-full">Minha Conta</span>
                    </div>
                  )}
                  <ChevronUp className="h-3.5 w-3.5 ml-auto opacity-30" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-[--radix-popper-anchor-width] mb-2 p-1">
                 <DropdownMenuItem onClick={() => navigate("/configuracoes")} className="flex items-center py-2 px-3 text-xs cursor-pointer rounded-md">
                   <Settings className="h-4 w-4 mr-2 opacity-70" />
                   Configurações
                 </DropdownMenuItem>
                 <DropdownMenuItem onClick={handleLogout} className="flex items-center py-2 px-3 text-xs text-destructive hover:bg-destructive/5 hover:text-destructive cursor-pointer rounded-md">
                   <LogOut className="h-4 w-4 mr-2" />
                   Sair da Plataforma
                 </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
    
    <FeedbackModal open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    <ContactModal open={contactOpen} onOpenChange={setContactOpen} />
    </>
  );
}
