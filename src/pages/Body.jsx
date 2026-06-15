import { useState, useEffect } from 'react';
import Card from '../components/Card/Card';
import Button from '../components/Button/Button';
import ExpandArrowIcon from '../components/icons/ExpandArrowIcon';

export default function Body() {
  const [isLoading, setIsLoading] = useState(true);
  
  //estados 
  const [weightData, setWeightData] = useState({ current: 0, trend: '', isPositive: true });
  const [weeklyProgress, setWeeklyProgress] = useState([]);
  const [muscleActivity, setMuscleActivity] = useState([]);

  useEffect(() => {
    // hacer los fetch a las tablas 
    const fetchBodyData = async () => {
      try {
        setIsLoading(true);
        
        // delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // mock, boceto de estructura de respuesta esperada
        const mockWeight = {
          current: 72.4,
          trend: '+0.6 kg',
          isPositive: true // detalle, para saber si la card es verde (subida de masa) o rojo/naranja
        };

        const mockWeekly = [
          { day: 'L', value: 20 },
          { day: 'M', value: 0 },
          { day: 'M', value: 40 },
          { day: 'J', value: 10 },
          { day: 'V', value: 80 },
          { day: 'S', value: 0 },
          { day: 'D', value: 0 },
        ];

        const mockMuscles = [
          { id: 1, name: 'Pecho', percentage: 82, colorClass: 'bg-karga-orange' },
          { id: 2, name: 'Espalda', percentage: 64, colorClass: 'bg-amber-500' },
          { id: 3, name: 'Piernas', percentage: 78, colorClass: 'bg-karga-orange' },
          { id: 4, name: 'Hombros', percentage: 50, colorClass: 'bg-zinc-500' },
        ];

        setWeightData(mockWeight);
        setWeeklyProgress(mockWeekly);
        setMuscleActivity(mockMuscles);
      } catch (error) {
        console.error("Error al cargar las métricas corporales:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBodyData();
  }, []);

  const handleRegisterWeight = () => {
    // aca navegar a la vista de registro de peso o abrir un modal
    console.log("Abriendo flujo de registro de peso...");
    // navigate('/body/weight'); por ejmplo
  };

  return (
    <div className="flex flex-col w-full animate-fade-in">
      
      {/* HEADER*/}
      <div className="mb-6 pl-2">
        <h1 className="text-3xl font-black text-white tracking-tight mb-1">
          Progreso físico
        </h1>
        <p className="text-sm font-medium text-zinc-400">
          Métricas de tu físico en el tiempo
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-t-karga-orange border-white/5 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          
          {/*PESO CORPORAL */}
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase mb-2 pl-2">
              Peso Corporal
            </span>
            <Card variant="default" className="p-5 flex flex-col gap-5">
              
              <div className="flex justify-between items-start">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-5xl font-black text-white tracking-tighter">
                    {weightData.current}
                  </span>
                  <span className="text-base font-medium text-zinc-400">
                    kg
                  </span>
                </div>

                {/* Badge de tendencia (Sube de peso) */}
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                  weightData.isPositive ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
                }`}>
                  {weightData.isPositive ? (
                    <ExpandArrowIcon/>
                  ) : (
                    <ExpandArrowIcon className="w-3.5 h-3.5 text-zinc-600"/>
                  )}
                  {weightData.trend}
                </div>
              </div>

              <Button 
                variant="primary" 
                className="w-full py-3.5 text-sm"
                onClick={handleRegisterWeight}
              >
                + Registrar peso
              </Button>
            </Card>
          </div>

          {/* PROGRESO SEMANAL */}
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase mb-2 pl-2">
              Progreso Semanal
            </span>
            <Card variant="default" className="p-6 h-40 flex items-end justify-between">
              {/* gráfico de barras generado con Tailwind */}
              {weeklyProgress.map((day, index) => (
                <div key={index} className="flex flex-col items-center gap-2 w-8 h-full">
                  {/* Track de la barra */}
                  <div className="w-full flex-1 bg-white/5 rounded-md relative flex items-end overflow-hidden">
                    {/* Fill de la barra */}
                    <div 
                      className="w-full bg-karga-orange rounded-sm transition-all duration-700 ease-out" 
                      style={{ height: `${day.value}%` }} 
                    />
                  </div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">
                    {day.day}
                  </span>
                </div>
              ))}
            </Card>
          </div>

          {/* ACTIVIDAD MUSCULAR . probablemente haya diferencia con las tablas*/}
          <div className="flex flex-col mb-4">
            <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase mb-2 pl-2">
              Actividad Muscular
            </span>
            <div className="flex flex-col gap-2">
              {muscleActivity.map((muscle) => (
                <Card 
                  key={muscle.id} 
                  variant="default" 
                  className="p-4 flex flex-col gap-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-white tracking-wide">
                      {muscle.name}
                    </span>
                    <span className="text-xs font-semibold text-zinc-400">
                      {muscle.percentage}%
                    </span>
                  </div>
                  
                  {/* barrahorizontal */}
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${muscle.colorClass}`} //
                      style={{ width: `${muscle.percentage}%` }}
                    />
                  </div>
                </Card>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}