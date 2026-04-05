import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface Organization {
  id: string;
  name: string;
  plan_type: string | null;
  credits_balance: number | null;
  cnpj?: string | null;
  location?: string | null;
  mission?: string | null;
  vision?: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  organization: Organization | null;
  role: "super_admin" | "org_admin" | "org_member" | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [role, setRole] = useState<AuthContextType["role"]>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserOrgAndRole(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserOrgAndRole(session.user.id);
      } else {
        setOrganization(null);
        setRole(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserOrgAndRole = async (userId: string) => {
    console.log("Auth: Fetching role/org for user", userId);

    // Guard: reject obviously invalid/dev user IDs immediately
    if (!userId.match(/^[0-9a-f-]{36}$/i)) {
      console.warn("Auth: Non-UUID userId detected — signing out.");
      await supabase.auth.signOut();
      setRole(null);
      setOrganization(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select(`
          role, 
          organization_id, 
          organizations (
            id, 
            name, 
            plan_type, 
            credits_balance,
            cnpj,
            location,
            mission,
            vision
          )
        `)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Auth: Error fetching role/org", error);
        throw error;
      }

      if (data) {
        console.log("Auth: Role found:", data.role);
        setRole(data.role as AuthContextType["role"]);
        if (data.organizations) {
          console.log("Auth: Org found:", data.organizations.name);
          setOrganization(data.organizations as unknown as Organization);
        } else {
          console.warn("Auth: User has role but no organization attached");
          setOrganization(null);
        }
      } else {
        console.warn("Auth: No entry found for user in user_roles table");
        setRole(null);
        setOrganization(null);
      }
    } catch (e: unknown) {
      console.error("Auth: Failed to fetch user role/org", e);
      // If the JWT is malformed/expired, or the user ID is invalid (e.g. 'fake' from dev),
      // clear the session automatically to prevent infinite blank-page state.
      const errMsg = (e as { message?: string })?.message ?? "";
      const errCode = (e as { code?: string })?.code ?? "";
      const isFatalAuthError =
        errMsg.includes("JWT") ||
        errMsg.includes("PGRST301") ||
        errCode === "PGRST301" ||
        errMsg.includes("401") ||
        errMsg.includes("400");
      if (isFatalAuthError || !userId.match(/^[0-9a-f-]{36}$/i)) {
        console.warn("Auth: Invalid session detected — signing out automatically.");
        await supabase.auth.signOut();
      }
      setRole(null);
      setOrganization(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, organization, role, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
