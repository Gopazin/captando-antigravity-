import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface Organization {
  id: string;
  name: string;
  plan_type: string;
  credits_balance: number;
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
    try {
      const { data, error } = await supabase
        .from("user_roles" as any)
        .select("role, organization_id, organizations(id, name, plan_type, credits_balance)")
        .eq("user_id", userId)
        .single();

      if (!error && (data as any)) {
        const anyData = data as any;
        setRole(anyData.role as AuthContextType["role"]);
        // Handle joined table typing dynamically
        const orgData = anyData.organizations as unknown as Organization; 
        setOrganization(orgData);
      }
    } catch (e) {
      console.error("Failed to fetch user role/org", e);
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
