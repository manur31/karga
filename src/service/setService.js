import { supabase } from "../lib/supabaseClient";
export const getSets = async () => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) throw userError;
  const { data, error } = await supabase
    .from("sets")
    .select(`
      *,
      exercises(*)
    `)
    .eq("profile_id", user.id);
  if (error) throw error;
  return data;
};
export const getSetforID = async (id) => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) throw userError;
  const { data, error } = await supabase
    .from("sets")
    .select(`
      *,
      exercises(*)
    `)
    .eq("profile_id", user.id)
    .eq("id", id);
  if (error) throw error;
  return data;
};
export const createSet = async ({ exercise_id, rep, weight }) => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) throw userError;
  const { data, error } = await supabase
    .from("sets")
    .insert([{ exercise_id, rep, weight, profile_id: user.id }]);
  if (error) throw error;
  return data;
};
export const deleteSet = async (id) => {
  const { error } = await supabase.from("sets").delete().eq("set_id", id);
  if (error) throw error;
};
export const updateSet = async ({ set_id, rep, weight }) => {
  const { error } = await supabase
    .from("sets")
    .update({ rep, weight })
    .eq("set_id", set_id)
  if (error) throw error;
};
