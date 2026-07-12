import { supabase } from "../lib/supabaseClient";
import { clearCachedProfile, setCachedProfile } from "../storage/profile-storage";
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

// export const getUser = async () => {
//   const { data, error } = await supabase.auth.getUser();
//   if (error) {
//     throw error;
//   }

//   const email = data?.user?.user_metadata?.email
//   const name = data?.user?.user_metadata?.name
//   const id = data?.user?.id

//   return { email, name, id };
// }

export const authGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  });

  if (error) {
    throw error;
  }

  // const { name, email, id } = await getUser();
  // console.log(name)
  // console.log(email)
  // console.log(id)

  // const { data: profileData } = await supabase
  //   .from("profile")
  //   .select('*')
  //   .eq("profile_id", id)
  //   .maybeSingle();

  //   console.log(profileData)

  // if (!profileData) {
  //   const { error: profileError } = await supabase.from("profile").insert([
  //     {
  //       profile_id: id,
  //       name,
  //       email,
  //     },
  //   ])

  //   if (profileError) {
  //     throw profileError;
  //   }
  // };

};

//login
export const login = async ({ email, password }) => {
  try {    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    } 

    getProfile()
    return data;
  } catch (error) {
    throw error;
  }
};

//logout
export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error.message;
    }
    
    clearCachedProfile();
    localStorage.clear()
  } catch (error) {
    throw error.message;
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

  const { data: profile, error } = await supabase
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

  setCachedProfile(profile);

  return {
    profile,
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

  console.log('Profile:', profile)
  setCachedProfile(profile);

  return profile;
};
