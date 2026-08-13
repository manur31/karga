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

  const { data, error } = await supabase
    .from("sessions")
    .insert(payload)
    .select();

  if (error) throw error;

  return data;
};
export const deleteSession = async ({ profile_id, session_id }) => {
  const { data, error } = await supabase
    .from("sessions")
    .delete()
    .eq("session_id", session_id)
    .eq("profile_id", profile_id)
    .select();

  if (error) throw error;

  if (!data || data.length === 0) {
    throw new Error(
      "No se eliminó ninguna sesión. Revisá session_id, profile_id o políticas RLS.",
    );
  }

  return data[0];
};
export const updateSession = async ({
  profile_id,
  session_id,
  startedAt,
  finishedAt,
  note,
}) => {
  const { data, error } = await supabase
    .from("sessions")
    .update({
      startedAt,
      finishedAt,
      note,
    })
    .eq("session_id", session_id)
    .eq("profile_id", profile_id)
    .select()
    .single();

  if (error) throw error;

  return data;
};
export const updateSessionWithSets = async ({
  profile_id,
  session_id,
  startedAt,
  finishedAt,
  note,
  sets = [],
  deletedSetIds = [],
}) => {
  const { data: updatedSession, error: sessionError } = await supabase
    .from("sessions")
    .update({
      startedAt,
      finishedAt,
      note,
    })
    .eq("session_id", session_id)
    .eq("profile_id", profile_id)
    .select()
    .single();

  if (sessionError) throw sessionError;

  if (deletedSetIds.length > 0) {
    const { error: deleteError } = await supabase
      .from("sets")
      .delete()
      .in("set_id", deletedSetIds)
      .eq("profile_id", profile_id);

    if (deleteError) throw deleteError;
  }

  const existingSets = sets.filter((set) => set.set_id);
  const newSets = sets.filter((set) => !set.set_id);

  const updatedSets = await Promise.all(
    existingSets.map(async (set) => {
      const { data, error } = await supabase
        .from("sets")
        .update({
          weight: set.weight,
          rep: set.rep,
          created_at: set.created_at,
        })
        .eq("set_id", set.set_id)
        .eq("profile_id", profile_id)
        .select()
        .single();

      if (error) throw error;

      return data;
    }),
  );

  let insertedSets = [];

  if (newSets.length > 0) {
    const rows = newSets.map((set) => ({
      profile_id,
      exercise_id: set.exercise_id,
      weight: set.weight,
      rep: set.rep,
      created_at: set.created_at,
    }));

    const { data, error } = await supabase.from("sets").insert(rows).select();

    if (error) throw error;

    insertedSets = data;
  }

  return {
    session: updatedSession,
    updatedSets,
    insertedSets,
    deletedSetIds,
  };
};
