import { supabase } from "../lib/supabaseClient";

export const getLastWeight = async (profileId) => {
  const { data, error } = await supabase
    .from("users_proge")
    .select("weight, created_at")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(2);

  if (error) throw error;

  return data;
};
export const registerWeight = async ({ profileId, weight }) => {
  const { data, error } = await supabase
    .from("users_proge")
    .insert([
      {
        profile_id: profileId,
        weight,
      },
    ])
    .select();

  if (error) throw error;

  return data;
};

export const getWeeklyProgress = async (profileId) => {
  const { data, error } = await supabase
    .from("users_proge")
    .select("weight, created_at")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return data;
};
