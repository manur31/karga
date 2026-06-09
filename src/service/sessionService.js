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
  time_init,
  time_end,
  note,
}) => {
  const { data, error } = await supabase
    .from("sessions")
    .insert([
      {
        time_init,
        time_end,
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
  time_end,
  time_init,
  note,
}) => {
  const { error } = await supabase
    .from("sessions")
    .update({
      time_init,
      time_end,
      note,
    })
    .eq("session_id", session_id)
    .eq("profile_id", profile_id);
  if (error) throw error;
};
