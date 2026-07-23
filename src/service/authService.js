import { supabase } from "../lib/supabaseClient";
import {
  clearCachedProfile,
  setCachedProfile,
} from "../storage/profile-storage";
//register
export const register = async ({ email, password, name }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) {
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
    throw profileError;
  }
};

export const authGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin,
    },
  });

  if (error) {
    throw error;
  }
};

//login
export const login = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    throw error;
  }

  getProfile();
  return data;
};

//logout
export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return error.message;
    }

    clearCachedProfile();
    localStorage.clear();
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
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;

  const { data, error } = await supabase
    .from("profile")
    .update({
      size,
      time_for_week,
      weight,
      rest_time,
    })
    .eq("profile_id", user.id)
    .select()
    .single();

  if (error) throw error;

  const { data: progressData, error: profileError } = await supabase
    .from("users_proge")
    .insert([
      {
        profile_id: user.id,
        weight,
        sets_id: null,
      },
    ]);

  if (profileError) {
    console.log("Error users_proge:", profileError);
    throw profileError;
  }

  setCachedProfile(data);

  return {
    profile: data,
    progress: progressData,
  };
};
//getProfile
export const getProfile = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  let { data: profile } = await supabase
    .from("profile")
    .select("*")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!profile) {
    const { error } = await supabase.from("profile").insert({
      profile_id: user.id,
      email: user.email,
      name: user.user_metadata.name,
    });

    if (error) throw error;

    const result = await supabase
      .from("profile")
      .select("*")
      .eq("profile_id", user.id)
      .single();

    profile = result.data;
  }

  setCachedProfile(profile);

  return profile;
};
//UpdateProfileDays
export const updateProfileDays = async ({ time_for_week, profile_id }) => {
  const { data, error } = await supabase
    .from("profile")
    .update({
      time_for_week,
    })
    .eq("profile_id", profile_id)
    .select()
    .single();
  if (error) throw error;
  return data;
};
//UpdateProfileRestTime
export const updateProfileRestTime = async ({ rest_time, profile_id }) => {
  const { data, error } = await supabase
    .from("profile")
    .update({
      rest_time: rest_time,
    })
    .eq("profile_id", profile_id)
    .select()
    .single();
  if (error) throw error;
  return data;
};
