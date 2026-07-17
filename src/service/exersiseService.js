import { supabase } from "../lib/supabaseClient";

export const getExercises = async (profile_id) => {
  const { data: userExercises, error: userExercisesError } = await supabase
    .from("user_exercises")
    .select("exercise_id")
    .eq("profile_id", profile_id);

  if (userExercisesError) throw userExercisesError;

  const exerciseIds = userExercises.map((exercise) => exercise.exercise_id);

  let query = supabase.from("exercises").select("*").eq("is_populary", true);

  if (exerciseIds.length > 0) {
    query = query.not("id", "in", `(${exerciseIds.join(",")})`);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data;
};

export const getFavoriteExercises = async (profile_id) => {
  const { data, error } = await supabase
    .from("user_exercises")
    .select(
      `
      *,
      exercises(*)
    `,
    )
    .eq("profile_id", profile_id);

  if (error) throw error;

  return data;
};

export const addToFavorite = async ({ exercise_id, profile_id }) => {
  const { data, error } = await supabase
    .from("user_exercises")
    .insert([
      {
        profile_id,
        exercise_id,
        is_favorite: true,
      },
    ])
    .select();

  if (error) throw error;

  return data;
};

export const createExercise = async ({ name, muscle, profile_id }) => {
  const { data: exercise, error: exerciseError } = await supabase
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
        profile_id,
        exercise_id: exercise.id,
        is_favorite: true,
      },
    ])
    .select();

  if (error) throw error;

  return data;
};

export const deleteExercise = async ({ exercise_id, profile_id }) => {
  const { data: exercise, error } = await supabase
    .from("exercises")
    .select("*")
    .eq("id", exercise_id)
    .single();

  if (error) throw error;

  const { error: userExerciseError } = await supabase
    .from("user_exercises")
    .delete()
    .eq("exercise_id", exercise_id)
    .eq("profile_id", profile_id);

  if (userExerciseError) throw userExerciseError;

  if (exercise.is_populary === false) {
    try {
      const { error: exerciseError } = await supabase
        .from("exercises")
        .delete()
        .eq("id", exercise_id);

      if (exerciseError) console.warn("No se pudo eliminar el ejercicio de la tabla global (posible RLS o llave foránea):", exerciseError);
    } catch (e) {
      console.warn("Error intentando eliminar el ejercicio global:", e);
    }
  }
};

export const updateFavorite = async ({
  exercise_id,
  profile_id,
  is_favorite,
}) => {
  const { data, error } = await supabase
    .from("user_exercises")
    .update({
      is_favorite,
    })
    .eq("exercise_id", exercise_id)
    .eq("profile_id", profile_id)
    .select();

  if (error) throw error;

  return data;
};

export const getExerciseForID = async ({ id, profile_id }) => {
  const { data, error } = await supabase
    .from("user_exercises")
    .select(
      `
      *,
      exercises(*)
    `,
    )
    .eq("exercise_id", id)
    .eq("profile_id", profile_id)
    .single();

  if (error) throw error;

  return data;
};

export const updateExercise = async ({ id, name, muscle }) => {
  const { data, error } = await supabase
    .from("exercises")
    .update({ name, muscle })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
};
