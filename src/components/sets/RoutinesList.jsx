import Card from "../../components/Card/Card";
import Avatar from "../../components/Avatar/Avatar";
import ChevronIcon from "../../components/icons/ChevronIcon";
import { formatRelativeTime } from "../../utils/timeFormatter";

export default function RoutinesList({ routines, onOpenRoutine }) {
  return (
    <div className="flex flex-col mb-10">
      <h2 className="text-lg font-bold text-white mb-4">Mis Rutinas</h2>
      <div className="flex flex-col gap-3">
        {routines.map((data) => {
          // podría ser con rhf
          const nameString = data.name || '';
          const displayName = nameString.trim() === '' ? 'Nueva rutina' : nameString;
          const initialLetter = displayName.charAt(0).toUpperCase();
          const exercisesCount = data.exercisesCount || 0;
          const lastDone = data.lastDone || null;

          return (
            <Card
              key={data.routine_id}
              variant="default"
              onClick={() => onOpenRoutine(data.routine_id)}
              className="p-4 flex flex-row items-center gap-4 cursor-pointer hover:bg-white/5 active:scale-[0.98] transition-all min-w-0 flex-1"
            >
              <Avatar initial={initialLetter} size="md" />
              
              <div className="flex flex-col flex-1 justify-center">
                <span className="text-[15px] font-bold text-zinc-100 mb-0.5">
                  {displayName}
                </span>
                <span className="text-xs text-zinc-500 font-medium">
                  {exercisesCount} {exercisesCount === 1 ? 'ejercicio' : 'ejercicios'} • {formatRelativeTime(lastDone)}
                </span>
              </div>

              <ChevronIcon className="w-5 h-5 text-zinc-600" direction="right" />
            </Card>
          );
        })}
      </div>
    </div>
  );
}
