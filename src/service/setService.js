import { supabase } from "../lib/supabaseClient";

export const getSets = async (profile_id) => {
  const { data, error } = await supabase
    .from("sets")
    .select(
      `
      *,
      exercises(*)
    `,
    )
    .eq("profile_id", profile_id);

  if (error) throw error;
  return data;
};

export const getSetforExercise = async ({ exercise_id, profile_id }) => {
  const { data, error } = await supabase
    .from("sets")
    .select(
      `
      *,
      exercises(*)
    `,
    )
    .eq("profile_id", profile_id)
    .eq("exercise_id", exercise_id);

  if (error) throw error;

  return data;
};

export const getSetforID = async (set_id, profile_id) => {
  const { data, error } = await supabase
    .from("sets")
    .select(
      `
      *,
      exercises(*)
    `,
    )
    .eq("profile_id", profile_id)
    .eq("set_id", set_id)
    .single();

  if (error) throw error;

  return data;
};

export const createSet = async ({ profile_id, exercise_id, rep, weight }) => {
  const { data, error } = await supabase
    .from("sets")
    .insert([
      {
        profile_id,
        exercise_id,
        rep,
        weight,
      },
    ])
    .select();

  if (error) throw error;

  return data;
};

export const deleteSet = async ({ set_id, profile_id }) => {
  const { error } = await supabase
    .from("sets")
    .delete()
    .eq("set_id", set_id)
    .eq("profile_id", profile_id);

  if (error) throw error;
};

export const updateSet = async ({ set_id, profile_id, rep, weight }) => {
  const { error } = await supabase
    .from("sets")
    .update({
      rep,
      weight,
    })
    .eq("set_id", set_id)
    .eq("profile_id", profile_id);

  if (error) throw error;
};
