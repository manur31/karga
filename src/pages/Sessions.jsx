import { useState } from 'react';
import { useSessions } from '../hooks/queries/useSessions';
import { useSets } from '../hooks/queries/useSets';
import { useAuth } from '../hooks/queries/useAuth';

import Mancuerna from '../components/icons/Mancuerna';
import { FiChevronRight } from 'react-icons/fi';
import SessionDetailModal from '../components/modals/SessionDetailModal';
import Card from '../components/Card/Card';
import { formatRelativeTime } from '../utils/timeFormatter';

export default function Sessions() {

  const { data: user } = useAuth();
  const profile_id = user?.profile_id;
  
  const { data: sessions, isLoading } = useSessions(profile_id);
  const { data: sets } = useSets(profile_id);

  const [sortOrder, setSortOrder] = useState('recent');
  const [selectedSession, setSelectedSession] = useState(null);

  // Helper para agrupar sesiones por mes/año
  const getGroupedSessions = (sessionsList, order) => {
    if (!sessionsList) return {};
    
    // Sort based on selected order
    const sorted = [...sessionsList].sort((a, b) => {
      return order === 'recent' 
        ? new Date(b.startedAt) - new Date(a.startedAt)
        : new Date(a.startedAt) - new Date(b.startedAt);
    });

    const groups = {};
    sorted.forEach(session => {
      const date = new Date(session.startedAt);
      let monthYear = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      // Capitalize first letter
      monthYear = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
      
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(session);
    });
    return groups;
  };

  const calculateDuration = (init, end) => {
    if (!end) return 'En curso';
    const startDate = new Date(init);
    const endDate = new Date(end);
    const diffInSeconds = Math.floor((endDate - startDate) / 1000);
    
    if (diffInSeconds < 0) return '00:00:00';

    const h = Math.floor(diffInSeconds / 3600);
    const m = Math.floor((diffInSeconds % 3600) / 60);
    const s = diffInSeconds % 60;

    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const getSessionTitle = (session, allSets) => {
    if (!allSets) return "0 ejercicios, 0 sets";

    const sessionSets = allSets.filter(set => {
      if (!set.created_at) return false;
      const setTime = new Date(set.created_at).getTime();
      const initTime = new Date(session.startedAt).getTime();
      const endTime = session.finishedAt ? new Date(session.finishedAt).getTime() : new Date().getTime();
      return setTime >= initTime && setTime <= endTime;
    });

    const setCount = sessionSets.length;
    const distinctExercises = new Set(sessionSets.map(set => set.exercise_id));
    const exerciseCount = distinctExercises.size;

    const exerciseText = exerciseCount === 1 ? "ejercicio" : "ejercicios";
    const setText = setCount === 1 ? "set" : "sets";
    
    return `${exerciseCount} ${exerciseText}, ${setCount} ${setText}`;
  };

  const groupedSessions = getGroupedSessions(sessions, sortOrder);

  return (
    <div className="flex flex-col w-full animate-fade-in pb-30 pt-10 px-4">
      {/* HEADER */}
      <div className="mb-6 pl-2">
        <h1 className="text-3xl font-black text-white tracking-tight mb-1">Mis Sesiones</h1>
        <p className="text-sm font-medium text-zinc-400">
          Grabar, ver y editar sesiones
        </p>
      </div>

      {/* ORDENAMIENTO */}
      <div className="flex items-center gap-2 mb-6 pl-2 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setSortOrder('recent')}
          className={`px-4 py-1.5 rounded-full font-bold text-sm transition-colors whitespace-nowrap border ${sortOrder === 'recent' ? 'bg-karga-orange text-white border-transparent' : 'bg-white/10 text-zinc-300 border-transparent'}`}
        >
          Más recientes
        </button>
        <button 
          onClick={() => setSortOrder('oldest')}
          className={`px-4 py-1.5 rounded-full font-bold text-sm transition-colors whitespace-nowrap border ${sortOrder === 'oldest' ? 'bg-karga-orange text-white border-transparent' : 'bg-[#2a2a2a] border-white/5 text-zinc-300'}`}
        >
          Más antiguas
        </button>
      </div>

      {/* LISTADO DE SESIONES */}
      <div className="flex flex-col gap-6">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-t-karga-orange border-white/10 rounded-full animate-spin" />
          </div>
        ) : Object.keys(groupedSessions).length === 0 ? (
          <div className="text-center text-zinc-500 py-10 font-medium">No hay sesiones aún</div>
        ) : (
          Object.entries(groupedSessions).map(([monthYear, monthSessions]) => (
            <div key={monthYear} className="flex flex-col">
              <h2 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-3 pl-2">{monthYear}</h2>
              
              <div className="flex flex-col gap-3">
                {monthSessions.map((session) => (
                  <Card 
                    key={session.session_id} 
                    variant="default"
                    onClick={() => setSelectedSession(session)}
                    className="p-4 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all min-w-0 flex-1 hover:bg-white/5 border-transparent"
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon Container */}
                      <div className="w-12 h-12 rounded-[10px] bg-karga-orange/10 flex items-center justify-center shrink-0">
                        <Mancuerna className="w-6 h-6 text-karga-orange" />
                      </div>
                      
                      {/* Text details */}
                      <div className="flex flex-col gap-0.5 justify-center">
                        <span className="text-[15px] font-bold text-zinc-100 mb-0.5">
                          {getSessionTitle(session, sets)}
                        </span>
                        <span className="text-zinc-400 text-sm font-medium">
                          {calculateDuration(session.startedAt, session.finishedAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-zinc-500 font-medium">
                        {formatRelativeTime(session.finishedAt || session.startedAt)}
                      </span>
                      <FiChevronRight className="w-5 h-5 text-zinc-600" />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {selectedSession && (
        <SessionDetailModal 
          session={selectedSession} 
          onClose={() => setSelectedSession(null)} 
        />
      )}



    </div>
  );
}