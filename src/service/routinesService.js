import { supabase } from "../lib/supabaseClient";
export const createRoutines = async ({ name, description }) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("routines")
    .insert([
      {
        name,
        description,
        profile_id: user.id,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};
export const deleteRoutines = async (routine_id) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("routines")
    .delete()
    .eq("routine_id", routine_id)
    .eq("profile_id", user.id);
  if (error) throw error;
};
export const insertExercisesRoutine = async ({
  routine_id,
  id_exercises,
  rest_time,
  orden,
}) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profile")
    .select("*")
    .eq("profile_id", user.id)
    .single();
  rest_time = rest_time ?? profile.rest_time;
  const { error } = await supabase
    .from("routines_exercises")
    .insert({
      routine_id,
      id_exercises,
      rest_time,
      orden,
    })
    .eq("profile_id", user.id);
  if (error) throw error;
};
export const getRoutines = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase.from("routines").update([
    {
      name,
      description,
      profile_id: user.id,
    },
  ]);

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
    .eq("profile_id", user.id);

  if (error) throw error;

  return data;
};
export const getRoutineforID = async (routine_id) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    .eq("profile_id", user.id)
    .eq("routine_id", routine_id);
  if (error) throw error;

  return data;
};
export const updateRoutines = async ({ routine_id, name }) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("routines")
    .update({ name })
    .eq("routine_id", routine_id)
    .eq("profile_id", user.id);
  if (error) throw error;
  return data;
};
