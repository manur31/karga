import { supabase } from "../lib/supabaseClient";
export const getAllExersises = async (id) => {
  const { data, error } = await supabase
    .from("exersises")
    .select("*")
    .eq("profile_id", id);
  if (error) {
    return error.message;
  }
  return data;
};
//enviar que sea false createExersise
export const createExersise = async () => {};
