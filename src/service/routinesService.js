import { supabase } from "../lib/supabaseClient";
export const getRoutines = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("routines")
    .select("*")
    .eq("profile_id", user.id);
  if (error) throw error;
  return data;
};
export const getRoutineforID = async ({ id }) => {
  const { data, error } = await supabase
    .from("routines")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
};

export const insertRoutines = async ({ name, id, description }) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase.from("routines").update([
    {
      name,
      exercises: id,
      description,
      profile_id: user.id,
    },
  ]);

  if (error) throw error;
  return data;
};
