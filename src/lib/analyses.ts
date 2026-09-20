import { supabase } from "./supabase";

export type AnalysisKind = "report" | "symptom" | "medicine";

export interface AnalysisRow {
  id: string;
  user_id: string;
  kind: AnalysisKind;
  title: string;
  input: string;
  result: unknown;
  created_at: string;
}

export async function saveAnalysis(input: {
  kind: AnalysisKind;
  title: string;
  input: string;
  result: unknown;
}) {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) throw new Error("Not signed in");

  const { data, error } = await supabase
    .from("analyses")
    .insert({
      user_id: user.id,
      kind: input.kind,
      title: input.title,
      input: input.input,
      result: input.result,
    })
    .select()
    .single();

  if (error) throw error;

  return data as AnalysisRow;
}

export async function listAnalyses(limit = 50): Promise<AnalysisRow[]> {
  const { data, error } = await supabase
    .from("analyses")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []) as AnalysisRow[];
}

export async function deleteAnalysis(id: string) {
  const { error } = await supabase
    .from("analyses")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function deleteAllAnalyses() {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) throw new Error("Not signed in");

  const { error } = await supabase
    .from("analyses")
    .delete()
    .eq("user_id", user.id);

  if (error) throw error;
}