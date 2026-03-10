import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";

export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border px-4 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
            <SidebarTrigger className="mr-4" />
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground hidden sm:block">Plano Free</span>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                U
              </div>
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