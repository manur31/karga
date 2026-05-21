import { supabase } from "../lib/supabaseClient";
//register
export const register = async ({ email, passsword, name }) => {
  const { data: UserData, error: UserError } = await supabase.auth.signUp({
    email: email,
    password: passsword,
  });
  if (UserError) {
    console.log("ocurrio un error al Registrar: ", UserError);
    return UserData;
  }
  if (UserData.user) {
    const { error } = await supabase
      .from("profile")
      .insert([
        {
          id: UserData.user.id,
          name,
          email,
        },
      ])
      .select();
    if (error) {
      await supabase.auth.admin.deleteUser(UserData.user.id);
      throw error;
    }
  }
  return UserData;
};

//login
export const login = async ({ email, password }) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) {
      console.log("Ocurrio un error al Inciar Sesion: ", error);
      return error.message;
    }
    if (data) {
      const profile = getProfile(email);
      return profile;
    }
  } catch (error) {
    return error.message;
  }
};

//logout
export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return error.message;
    }
  } catch (error) {
    return error.message;
  }
};
//setProfile
export const setProfile = async ({
  size,
  weight,
  time_for_week,
  rest_time,
  id,
}) => {
  const { data, error } = await supabase
    .from("profile")
    .update([
      {
        size: size,
        time_for_week: time_for_week,
        weight: weight,
        rest_time: rest_time,
      },
    ])
    .eq("id", id);
  if (error) {
    return error.message;
  }
  return data;
};
//getProfile
export const getProfile = async (email) => {
  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .eq("email", email);
  if (error) {
    return error.message;
  }
  return data;
};
