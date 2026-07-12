import { useMemo } from "react";
import Card from "../Card/Card";

export const WeekActivity = ({ weekSessions, user }) => {
  const weeklyActivity = useMemo(() => {
    const goalDays = user?.time_for_week || 0;

    if (!weekSessions || goalDays === 0) {
      return {
        trainedDays: 0,
        goalDays,
      };
    }

    const uniqueDays = new Set(
      weekSessions.map((session) => {
        return new Date(session.startedAt).toISOString().split("T")[0];
      }),
    );

    return {
      trainedDays: uniqueDays.size,
      goalDays,
    };
  }, [weekSessions, user?.time_for_week]);
  return (
    <div className="flex flex-col mb-4">
      <div className="flex items-center gap-3 mb-5 mt-4">
        <div className="h-5 w-1 bg-karga-orange rounded-full" />
        <h2 className="text-lg font-black text-white tracking-wide">
          Actividad Semanal
        </h2>
        <div className="flex-1 h-[1px] bg-white/5" />
      </div>

      <Card variant="default" className="p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white tracking-wide">
              Días entrenados
            </span>

            <span className="text-xs text-zinc-400">Meta semanal</span>
          </div>

          <span className="text-lg font-black text-white">
            {weeklyActivity.trainedDays}/{weeklyActivity.goalDays}
          </span>
        </div>

        <div className="flex gap-2">
          {Array.from({ length: weeklyActivity.goalDays }).map((_, index) => {
            const isCompleted = index < weeklyActivity.trainedDays;

            return (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full transition-all ${
                  isCompleted ? "bg-karga-orange" : "bg-white/10"
                }`}
              />
            );
          })}
        </div>
      </Card>
    </div>
  );
};
