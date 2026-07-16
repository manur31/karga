import Card from "../../components/Card/Card";
import FlameIcon from "../../components/icons/FlameIcon";

export default function StatsCards({ stats, isLoading }) {
  return (
    <div className="grid grid-cols-2 gap-3 mb-8">
      {/* card de esta semana */}
      <Card variant="default" className="p-4 flex flex-col justify-between h-24">
        <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
          <FlameIcon />
          Esta semana
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-white leading-none">
            {isLoading ? "-" : stats.weeklyWorkouts}
          </span>
          <span className="text-[10px] text-zinc-500 font-bold uppercase">
            sesiones
          </span>
        </div>
      </Card>
      {/* card de racha */}
      <Card variant="default" className="p-4 flex flex-col justify-between h-24">
        <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
          Racha
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-white leading-none">
            {isLoading ? "-" : stats.streak}
          </span>
          <span className="text-[10px] text-zinc-500 font-bold uppercase">
            días
          </span>
        </div>
      </Card>
    </div>
  );
}
