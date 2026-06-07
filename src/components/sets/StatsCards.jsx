import Card from "../../components/Card/Card";
import FlameIcon from "../../components/icons/FlameIcon";

export default function StatsCards({ stats, isLoading }) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-8">
      {/* card de esta semana */}
      <Card variant="default" className="p-5 flex flex-col justify-between h-32">
        <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold tracking-wide">
          <FlameIcon />
          Esta semana
        </div>
        <div className="flex flex-col">
          <span className="text-3xl font-black text-white leading-none mb-1">
            {isLoading ? "-" : stats.weeklyWorkouts}
          </span>
          <span className="text-[11px] text-zinc-500 font-medium">
            entrenamientos
          </span>
        </div>
      </Card>
      {/* card de racha */}
      <Card variant="default" className="p-5 flex flex-col justify-between h-32">
        <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold tracking-wide">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
          Racha
        </div>
        <div className="flex flex-col">
          <span className="text-3xl font-black text-white leading-none mb-1">
            {isLoading ? "-" : stats.streak}
          </span>
          <span className="text-[11px] text-zinc-500 font-medium">
            días seguidos
          </span>
        </div>
      </Card>
    </div>
  );
}
