import { supabase } from "../lib/supabaseClient";
//register
export const register = async ({ email, password, name }) => {
  console.log(email, password, name);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) {
    console.log(error);
    throw error;
  }
  const { error: profileError } = await supabase.from("profile").insert([
    {
      profile_id: data.user.id,
      name,
      email,
    },
  ]);

  if (profileError) {
    console.log(profileError);
    throw profileError;
  }
  return getProfile();
};

//login
export const login = async ({ email, password }) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.log("Ocurrio un error al Inciar Sesion: ", error);
      return error.message;
    }

    console.log("login data", data);
    if (data) {
      const profile = await getProfile(email);
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
}) => {
  const { data, error } = await supabase
    .from("profile")
<<<<<<< Updated upstream
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
=======
    .update({
      size,
      time_for_week,
      weight,
      rest_time,
    })
    .eq("profile_id", user.id)
    .select();
  if (error) {
    console.log(error);
    return error.message;
  }

  console.log(data);
>>>>>>> Stashed changes
  return data;
};
//getProfile
export const getProfile = async () => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }
  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .eq("profile_id", user.id)
    .single();
  if (error) {
    throw error;
  }
  return data;
};
