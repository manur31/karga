import { supabase } from "../lib/supabaseClient";
export const getSets = async () => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) throw userError;
  const { data, error } = await supabase
    .from("sets")
    .select(
      `
      *,
      exercises{*}
    `,
    )
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
    .select(
      `
      *,
      exercises{*}
    `,
    )
    .eq("profile_id", user.id)
    .eq("id", id);
  if (error) throw error;
  return data;
};
export const createSet = async ({ exercise_id, reps, weight }) => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) throw userError;
  const { data, error } = await supabase
    .from("sets")
    .insert([{ exercise_id, reps, weight, profile_id: user.id }]);
  if (error) throw error;
  return data;
};
export const deleteSet = async (id) => {
  const { error } = await supabase.from("sets").delete().eq("id", id);
  if (error) throw error;
};
export const updateSet = async ({ id, exercise_id, reps, weight }) => {
  const { error } = await supabase
    .from("sets")
    .update({ reps, weight })
    .eq("id", id)
    .eq("exercise_id", exercise_id);
  if (error) throw error;
};
