import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SelectedGrant {
  id: string;
  title: string;
  organization: string;
  area: string;
  max_value: number;
  deadline: string | null;
  eligibility: string;
  description: string;
  source_url: string | null;
  is_selected: boolean;
}

export function useSelectedGrants() {
  const [grants, setGrants] = useState<SelectedGrant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSelectedGrants = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("grants")
      .select("*")
      .eq("is_selected", true)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching selected grants:", error);
    } else {
      setGrants((data as unknown as SelectedGrant[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSelectedGrants();
    const channel = supabase
      .channel("grants-selected")
      .on("postgres_changes", { event: "*", schema: "public", table: "grants" }, () => fetchSelectedGrants())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchSelectedGrants]);

  const toggleSelected = async (grantId: string, isSelected: boolean) => {
    const { error } = await supabase
      .from("grants")
      .update({ is_selected: isSelected })
      .eq("id", grantId);
    if (error) {
      toast.error("Erro ao atualizar seleção");
      return false;
    }
    toast.success(isSelected ? "Edital marcado como interesse" : "Edital desmarcado");
    return true;
  };

  return { grants, loading, fetchSelectedGrants, toggleSelected };
}
