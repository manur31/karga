import { supabase } from "../lib/supabaseClient";

export const registerWeight = async ({ profile_id, weight }) => {
  const { data: profileData, error: profileError } = await supabase
    .from("profile")
    .update({
      weight,
    })
    .eq("profile_id", profile_id)
    .select()
    .single();

  if (profileError) throw profileError;

  const { data: progressData, error: progressError } = await supabase
    .from("users_proge")
    .insert([
      {
        profile_id,
        weight,
        sets_id: null,
      },
    ])
    .select();

  if (progressError) throw progressError;

  return {
    profile: profileData,
    progress: progressData,
  };
};

export const getBodyLastWeek = async (profile_id) => {
  const lastWeek = new Date();

  lastWeek.setDate(lastWeek.getDate() - 7);

  const { data, error } = await supabase
    .from("users_proge")
    .select("*")
    .eq("profile_id", profile_id)
    .gte("created_at", lastWeek.toISOString())
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
};
