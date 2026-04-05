import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { UserNav } from "@/components/UserNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Outlet } from "react-router-dom";

export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-50/10">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center justify-between border-b border-border/40 px-6 bg-white/60 backdrop-blur-md sticky top-0 z-40 transition-all shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="h-9 w-9 hover:bg-accent/10 hover:text-accent transition-colors" />
              <div className="h-5 w-[1px] bg-border/50 hidden sm:block" />
              <h2 className="text-sm font-medium text-muted-foreground hidden md:block">
                Painel Administrativo
              </h2>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
               <ThemeToggle />
               <UserNav />
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
          <footer className="border-t border-border px-6 py-3 text-[10px] text-muted-foreground hidden lg:block">
            Captando é a infraestrutura definitiva para o ciclo completo do recurso público. Unimos inteligência artificial de ponta, monitoramento ativo de editais e uma gestão de compliance rigorosa para transformar a captação de recursos em um processo seguro, profissional e escalável para prefeituras, associações e empresas.
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}