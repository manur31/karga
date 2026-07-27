import { setToSupabase, setFromSupabase } from './mappers/setsMapper';
// import { sessionToSupabase, sessionFromSupabase } from './mappers/sessionsMapper';
// ... mappers de las demás entidades cuando les toque su fase 5/6

export const syncableEntities = [
  { table: 'sets', supabaseTable: 'sets', toSupabase: setToSupabase, fromSupabase: setFromSupabase },
  // { table: 'sessions', supabaseTable: 'sessions', toSupabase: sessionToSupabase, fromSupabase: sessionFromSupabase },
];