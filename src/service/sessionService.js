import { supabase } from "../lib/supabaseClient";
import { endOfWeek, startOfWeek } from "date-fns";

export const getWeekActivity = async (profile_id) => {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString();
  const end = endOfWeek(new Date(), { weekStartsOn: 1 }).toISOString();

  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("profile_id", profile_id)
    .gte("startedAt", start)
    .lte("startedAt", end)
    .order("startedAt", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
};

export const getSession = async (profile_id) => {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("profile_id", profile_id);
  if (error) throw error;
  return data;
};
export const insertSession = async (sessions) => {
  const payload = Array.isArray(sessions) ? sessions : [sessions];

  const { data, error } = await supabase.from("sessions").insert(payload).select();

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
  startedAt,
  finishedAt,
  note,
}) => {
  const { error } = await supabase
    .from("sessions")
    .update({
      startedAt: startedAt || null,
      finishedAt: finishedAt || null,
      note: note || null,
    })
    .eq("session_id", session_id)
    .eq("profile_id", profile_id);
  if (error) throw error;
};
