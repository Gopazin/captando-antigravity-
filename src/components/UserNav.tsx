import { useAuth } from "@/context/AuthProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Settings, LogOut, User, Crown, ServerCog } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function UserNav() {
  const { user, organization, role, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuário";
  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  const planType = organization?.plan_type || "Free";
  const roleLabel = role === "super_admin" 
    ? "Super Admin" 
    : role === "gestor" 
      ? "Gestor" 
      : "Membro";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-auto flex items-center gap-2.5 px-2 hover:bg-accent/50 rounded-full transition-all">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-xs font-bold leading-none">{name}</span>
            <div className="flex items-center gap-1.5 mt-1">
              <Badge variant="outline" className="text-[9px] py-0 h-3.5 bg-accent/10 border-accent/20 text-accent font-semibold uppercase tracking-wider">
                {planType}
              </Badge>
            </div>
          </div>
          <Avatar className="h-8 w-8 border border-border/50 shadow-sm transition-transform group-hover:scale-105">
            <AvatarImage src={user?.user_metadata?.avatar_url} alt={name} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
            <div className="flex items-center gap-2 mt-2">
               <Badge variant="secondary" className="text-[10px] h-4">
                 {roleLabel}
               </Badge>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => navigate("/configuracoes")} className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Configurações</span>
          </DropdownMenuItem>
          {planType === "Free" && (
             <DropdownMenuItem onClick={() => navigate("/configuracoes")} className="cursor-pointer text-accent font-medium">
               <Crown className="mr-2 h-4 w-4" />
               <span>Fazer Upgrade</span>
             </DropdownMenuItem>
          )}
          {role === "super_admin" && (
            <DropdownMenuItem onClick={() => navigate("/plataforma")} className="cursor-pointer text-warning font-semibold">
              <ServerCog className="mr-2 h-4 w-4" />
              <span>Painel da Plataforma</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
