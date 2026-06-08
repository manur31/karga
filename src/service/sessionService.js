import { supabase } from "../lib/supabaseClient";
export const getSession= async ()=>{
    const {data:user, error:userError}= await supabase.auth.getUser();
    if(userError) throw error;
    const {data, error} = await supabase.from("sessions").select("*").eq("profile_id",user.id)
    if(error)throw error;
    return data;

}