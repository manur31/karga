import { supabase } from "../lib/supabaseClient";
export const getSession= async ()=>{
    const {data:user, error:userError}= await supabase.auth.getUser();
    if(userError) throw error;
    const {data, error} = await supabase.from("sessions").select("*").eq("profile_id",user.id)
    if(error)throw error;
    return data;
}
export const insertSession = async ({time_init, time_end,note})=>{
    const {data:user, error:userError}= await supabase.auth.getUser();
    if(userError) throw error;
    const {data,error}=await supabase.from("sessions").insert([{
        time_init,
        time_end,
        profile_id:user.id,
        note,
    }])
    if(error) throw error;
    return data;
}
export const deleteSession= async (id)=>{
    const{data: user, error:userError}= await supabase.auth.getUser();
    if(userError) throw userError;
    const{error}=await supabase.from("sessions").delete().eq("session_id",id);
    if(error)throw error;
}