import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Card from '../components/Card/Card';
import CalendarIcon from '../components/icons/CalendarIcon';
import ClockIcon from '../components/icons/ClockIcon';
import ChevronIcon from '../components/icons/ChevronIcon';
import { Mancuerna } from '../components/icons';
import FlameIcon from '../components/icons/FlameIcon';

export default function Sessions() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  // estados q usarian la bdd una vez integrada
  const [stats, setStats] = useState({ thisMonth: 0, totalHours: 0 });
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    // hacer el fetch a la tabla de sesiones completadas del usuario
    const fetchSessionsData = async () => {
      try {
        setIsLoading(true);
        
        // delay simulado, 
        await new Promise(resolve => setTimeout(resolve, 800));

        // mock con la estructura de la consulta
        const mockStats = {
          thisMonth: 18,
          totalHours: 16.5
        };

        const mockSessions = [
          { 
            id: 1, 
            name: 'Push Day', 
            date: 'Hoy • 09:30', 
            duration: '52 min', 
            volume: '4,250',
            calories: '320' 
          },
          { 
            id: 2, 
            name: 'Legs', 
            date: 'Ayer • 10:00', 
            duration: '65 min', 
            volume: '6,800', 
            calories: '480' 
          },
          { 
            id: 3, 
            name: 'Pull Day', 
            date: 'Hace 2 días • 08:45', 
            duration: '48 min', 
            volume: '3,900', 
            calories: '290' 
          }
        ];

        setStats(mockStats);
        setSessions(mockSessions);
      } catch (error) {
        console.error("Error al cargar el historial de sesiones:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionsData();
  }, []);

  const handleOpenSessionDetail = (id) => {
    // navegaria al detalle de la sesión finalizada
    console.log(`Abriendo detalle de sesión ID: ${id}`);
    // navigate(`/sessions/${id}`);
  };

  return (
    <div className="flex flex-col w-full animate-fade-in">
      
      {/* HEADER */}
      <div className="mb-6 pl-2">
        <h1 className="text-3xl font-black text-white tracking-tight mb-1">
          Sesiones
        </h1>
        <p className="text-sm font-medium text-zinc-400">
          Historial de entrenamientos
        </p>
      </div>

      {/* ESTADÍSTICAS GLOBALES */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        
        {/* card de este mes */}
        <Card variant="default" className="!p-4 flex flex-col justify-between h-[104px]">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold tracking-wide">
            <CalendarIcon/>
            Este mes
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-black text-white leading-none mb-0.5">
              {isLoading ? '-' : stats.thisMonth}
            </span>
            <span className="text-[11px] text-zinc-500 font-medium tracking-wide">sesiones</span>
          </div>
        </Card>

        {/* card de tiempo total */}
        <Card variant="default" className="!p-4 flex flex-col justify-between h-[104px]">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold tracking-wide">
            <ClockIcon/>
            Tiempo total
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-black text-white leading-none mb-0.5">
              {isLoading ? '-' : stats.totalHours}
            </span>
            <span className="text-[11px] text-zinc-500 font-medium tracking-wide">horas</span>
          </div>
        </Card>

      </div>

      {/* HISTORIAL DE SESIONES */}
      <div className="flex flex-col">
        <h2 className="text-lg font-bold text-white mb-4 pl-2">Historial</h2>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-t-karga-orange border-white/5 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sessions.map((session) => (
              <Card 
                key={session.id} 
                variant="default"
                onClick={() => handleOpenSessionDetail(session.id)}
                className="!p-4 flex flex-col gap-3 cursor-pointer hover:bg-white/5 active:scale-[0.98] transition-all"
              >
                {/* fila de título, fecha y flecha */}
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="text-base font-bold text-zinc-100 leading-tight">
                      {session.name}
                    </span>
                    <span className="text-xs font-medium text-zinc-500 mt-0.5">
                      {session.date}
                    </span>
                  </div>
                  <ChevronIcon className="w-5 h-5 text-zinc-600 mt-1" direction="right" />
                </div>

                {/* fila  con las metricas de duración, volumen y calorías) */}
                <div className="flex items-center gap-4 mt-1">
                  
                  {/* duración */}
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <ClockIcon className="w-3.5 h-3.5 text-red-500" />
                    <span className="text-xs font-medium">{session.duration}</span>
                  </div>

                  {/* volumen de carga */}
                  <div className="flex items-center gap-1.5">
                    <Mancuerna className="w-3.5 h-3.5 text-karga-orange" />
                    <span className="text-xs font-bold text-white tracking-wide">{session.volume} kg</span>
                  </div>

                  {/* calorías */}
                  <div className="flex items-center gap-1.5">
                    <FlameIcon className="w-3.5 h-3.5 text-red-500" />
                    <span className="text-xs font-bold text-white tracking-wide">{session.calories} kcal</span>
                  </div>

                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}