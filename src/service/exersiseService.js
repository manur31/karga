import { supabase } from "../lib/supabaseClient";
export const getExersises = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
export const getFavoriteExercises = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("user_exercises")
    .select(
      `
      *,
      exercises(*)
    `,
    )
    .eq("profile_id", user.id)
    .eq("is_favorite", true);
  if (error) throw error;
  return data;
};

export const selectExercise = async (id) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: exercises, error } = await supabase
    .from("exercises")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  const { data } = await supabase
    .from("user_exercises")
    .update([
      {
        profile_id: user.id,
        exercises_id: exercises.id,
        is_favorite: true,
      },
    ])
    .eq("profile_id", user.id);
  return data;
};

export const createExercise = async ({ name, category, muscle }) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: exercises, error } = await supabase.from("exercises").update([
    {
      name,
      category,
      muscle,
      is_populary: false,
    },
  ]);
  const { data } = await supabase
    .from("user_exercises")
    .update([
      {
        profile_id: user.id,
        exercises_id: exercises.id,
        is_favorite: true,
      },
    ])
    .eq("profile_id", user.id);
  if (error) throw error;
  return data;
};
export const deleteExercise = async (exerciseId) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("user_exercises")
    .delete()
    .eq("exercise_id", exerciseId)
    .eq("profile_id", user.id);

  if (error) throw error;
};
// un ejercicio popular se quita de ser popular
export const updateExerciseFavorite = async (exercise_id, is_favorite) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
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
