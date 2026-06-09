import { supabase } from "../lib/supabaseClient";

export const createRoutines = async ({ profile_id, name, description }) => {
  const { data: routineData, error } = await supabase
    .from("routines")
    .insert([
      {
        name,
        description,
        profile_id,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return routineData;
};

export const deleteRoutines = async ({ profile_id, routine_id }) => {
  const { error } = await supabase
    .from("routines")
    .delete()
    .eq("routine_id", routine_id)
    .eq("profile_id", profile_id);

  if (error) throw error;
};

export const insertExercisesRoutine = async ({
  profile_id,
  routine_id,
  id_exercises,
  rest_time,
  orden,
}) => {
  const { data: profile, error: profileError } = await supabase
    .from("profile")
    .select("rest_time")
    .eq("profile_id", profile_id)
    .single();

  if (profileError) throw profileError;

  const finalRestTime = rest_time ?? profile.rest_time;

  const { data, error } = await supabase
    .from("routines_exercises")
    .insert({
      routine_id,
      id_exercises,
      rest_time: finalRestTime,
      orden,
    })
    .select();

  if (error) throw error;

  return data;
};

export const getRoutines = async (profile_id) => {
  const { data, error } = await supabase
    .from("routines")
    .select(
      `
      *,
      routines_exercises (
        *,
        exercises (*)
      )
    `,
    )
    .eq("profile_id", profile_id);

  if (error) throw error;

  return data;
};

export const getRoutineforID = async ({ profile_id, routine_id }) => {
  const { data, error } = await supabase
    .from("routines")
    .select(
      `
      *,
      routines_exercises (
        *,
        exercises (*)
      )
    `,
    )
    .eq("profile_id", profile_id)
    .eq("routine_id", routine_id)
    .single();

  if (error) throw error;

  return data;
};

export const updateRoutines = async ({ profile_id, routine_id, name }) => {
  const { data, error } = await supabase
    .from("routines")
    .update({ name })
    .eq("routine_id", routine_id)
    .eq("profile_id", profile_id)
    .select()
    .single();

  if (error) throw error;

  return data;
};
