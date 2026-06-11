import { supabase } from "../lib/supabaseClient";
export const getSession = async (profile_id) => {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("profile_id", profile_id);
  if (error) throw error;
  return data;
};
export const insertSession = async ({
  profile_id,
  startedAt,
  finishedAt,
  note,
}) => {
  const { data, error } = await supabase
    .from("sessions")
    .insert([
      {
        startedAt,
        finishedAt,
        profile_id,
        note,
      },
    ])
    .select();

  if (error) throw error;

  return data;
};
export const deleteSession = async ({ profile_id, session_id }) => {
  const { error } = await supabase
    .from("sessions")
    .delete()
    .eq("session_id", session_id)
    .eq("profile_id", profile_id);
  if (error) throw error;
};
export const updateSession = async ({
  profile_id,
  session_id,
  finishedAt,
  startedAt,
  note,
}) => {
  const { error } = await supabase
    .from("sessions")
    .update({
      startedAt,
      finishedAt,
      note,
    })
    .eq("session_id", session_id)
    .eq("profile_id", profile_id);
  if (error) throw error;
};
