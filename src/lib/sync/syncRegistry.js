import { setToSupabase, setFromSupabase } from './mappers/setsMapper';
import { sessionToSupabase, sessionFromSupabase } from './mappers/sessionsMapper';
import {
  bodyProgressToSupabase,
  bodyProgressFromSupabase,
} from './mappers/bodyProgressMapper';
import { routineToSupabase, routineFromSupabase } from './mappers/routinesMapper';
import {
  routineExerciseToSupabase,
  routineExerciseFromSupabase,
} from './mappers/routinesExercisesMapper';
import {
  userExerciseToSupabase,
  userExerciseFromSupabase,
} from './mappers/userExercisesMapper';
import { profileToSupabase, profileFromSupabase } from './mappers/profileMapper';
import {
  exerciseFromSupabase,
  exerciseToSupabase,
} from './mappers/exercisesMapper';

/** Entities that push Dexie → Supabase and pull Supabase → Dexie */
export const syncableEntities = [
  {
    table: 'sets',
    supabaseTable: 'sets',
    pkField: 'set_id',
    toSupabase: setToSupabase,
    fromSupabase: setFromSupabase,
  },
  {
    table: 'sessions',
    supabaseTable: 'sessions',
    pkField: 'session_id',
    toSupabase: sessionToSupabase,
    fromSupabase: sessionFromSupabase,
  },
  {
    table: 'bodyProgress',
    supabaseTable: 'users_proge',
    pkField: 'id',
    toSupabase: bodyProgressToSupabase,
    fromSupabase: bodyProgressFromSupabase,
  },
  {
    table: 'routines',
    supabaseTable: 'routines',
    pkField: 'routine_id',
    toSupabase: routineToSupabase,
    fromSupabase: routineFromSupabase,
  },
  {
    table: 'routinesExercises',
    supabaseTable: 'routines_exercises',
    pkField: 'composite',
    compositeKeys: [
      { local: 'routineId', remote: 'routine_id' },
      { local: 'exerciseId', remote: 'id_exercises' },
    ],
    toSupabase: routineExerciseToSupabase,
    fromSupabase: routineExerciseFromSupabase,
  },
  {
    table: 'userExercises',
    supabaseTable: 'user_exercises',
    pkField: 'id',
    toSupabase: userExerciseToSupabase,
    fromSupabase: userExerciseFromSupabase,
  },
  {
    table: 'profile',
    supabaseTable: 'profile',
    pkField: 'profile_id',
    toSupabase: profileToSupabase,
    fromSupabase: profileFromSupabase,
  },
];

/** Read-only catalog pulled from server (never pushed as a syncable entity) */
export const pullOnlyEntities = [
  {
    table: 'exercises',
    supabaseTable: 'exercises',
    fromSupabase: exerciseFromSupabase,
    readOnly: true,
  },
];

export { exerciseToSupabase };
