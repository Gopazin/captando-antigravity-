import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProjectHealthScore {
  project_id: string;
  conformidade: number | null;
  merito: number | null;
  alinhamento: number | null;
  avgScore: number | null;
}

export function useProjectHealthScores(projectIds: string[]) {
  const [scores, setScores] = useState<Record<string, ProjectHealthScore>>({});
  const [loading, setLoading] = useState(false);

  const projectIdsKey = projectIds.join(",");

  useEffect(() => {
    if (projectIds.length === 0) return;

    const fetchScores = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("project_evaluations")
        .select("project_id, layer, score")
        .in("project_id", projectIds)
        .order("created_at", { ascending: false });

      if (!error && data) {
        const grouped: Record<string, ProjectHealthScore> = {};

        for (const row of data) {
          if (!grouped[row.project_id]) {
            grouped[row.project_id] = {
              project_id: row.project_id,
              conformidade: null,
              merito: null,
              alinhamento: null,
              avgScore: null,
            };
          }
          // Only set if not already set (we want the most recent per layer)
          if (row.layer === "conformidade" && grouped[row.project_id].conformidade === null) {
            grouped[row.project_id].conformidade = row.score;
          }
          if (row.layer === "merito" && grouped[row.project_id].merito === null) {
            grouped[row.project_id].merito = row.score;
          }
          if (row.layer === "alinhamento" && grouped[row.project_id].alinhamento === null) {
            grouped[row.project_id].alinhamento = row.score;
          }
        }

        // Calculate avg for each project
        for (const pid of Object.keys(grouped)) {
          const g = grouped[pid];
          const vals = [g.conformidade, g.merito, g.alinhamento].filter(v => v !== null) as number[];
          g.avgScore = vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
        }

        setScores(grouped);
      }
      setLoading(false);
    };

    fetchScores();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectIdsKey]);

  return { scores, loading };
}
