import { supabase } from "../lib/supabaseClient";

export const getExercises = async () => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;

  const { data: userExercises } = await supabase
    .from("user_exercises")
    .select("exercise_id")
    .eq("profile_id", user.id);

  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .not(
      "id",
      "in",
      `(${userExercises.map((exercise) => exercise.exercise_id).join(",")})`,
    )
    .eq("is_populary", true);
  if (error) throw error;
  return data;
};

export const getFavoriteExercises = async () => {
  const {
    data: { user, error: userError },
  } = await supabase.auth.getUser();

  if (userError) throw userError;

  const { data, error } = await supabase
    .from("user_exercises")
    .select(
      `
        *,
        exercises(*)
      `,
    )
    .eq("profile_id", user.id);
  if (error) throw error;
  return data;
};

export const addToFavorite = async (id) => {
  const {
    data: { user, error: userError },
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  const { data: exercises, error } = await supabase
    .from("exercises")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;

  const { data, error: updateError } = await supabase
    .from("user_exercises")
    .insert([
      {
        profile_id: user.id,
        exercise_id: exercises.id,
        is_favorite: true,
      },
    ])
    .eq("profile_id", user.id);

  if (updateError) throw updateError;

  return data;
};

export const createExercise = async ({ name, muscle }) => {
  const {
    data: { user, error: userError },
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  const { data: exercises, error: exerciseError } = await supabase
    .from("exercises")
    .insert([
      {
        name,
        muscle,
        is_populary: false,
      },
    ])
    .select()
    .single();

  if (exerciseError) throw exerciseError;

  const { data, error } = await supabase
    .from("user_exercises")
    .insert([
      {
        profile_id: user.id,
        exercise_id: exercises.id,
        is_favorite: false,
      },
    ])
    .eq("profile_id", user.id);
  if (error) throw error;

  return data;
};
export const deleteExercise = async (exerciseId) => {
  const {
    data: { user, error: userError },
  } = await supabase.auth.getUser();

  if (userError) throw userError;

  const { data: userExercise, error } = await supabase
    .from("exercises")
    .select()
    .eq("id", exerciseId)
    .single();

  if (error) throw error;
  if (userExercise.is_populary == false) {
    await supabase
      .from("user_exercises")
      .delete()
      .eq("exercise_id", exerciseId)
      .eq("profile_id", user.id);
    const { error: exerciseError } = await supabase
      .from("exercises")
      .delete()
      .eq("id", exerciseId);
    if (exerciseError) throw exerciseError;
  } else {
    const { error: exerciseError } = await supabase
      .from("user_exercises")
      .delete()
      .eq("exercise_id", exerciseId)
      .eq("profile_id", user.id);
    if (exerciseError) throw exerciseError;
  }
};
// un ejercicio popular se quita de ser popular
export const updateFavorite = async ({ exercise_id, is_favorite }) => {
  const {
    data: { user, error: userError },
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  const { error } = await supabase
    .from("user_exercises")
    .update([
      {
        is_favorite,
      },
    ])
    .eq("exercise_id", exercise_id)
    .eq("profile_id", user.id)
    .select();
  if (error) throw error;
};
