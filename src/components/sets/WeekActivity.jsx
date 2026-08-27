import { useMemo } from "react";
import { format } from "date-fns";
import Card from "../Card/Card";

export const WeekActivity = ({
  profile,
  weekSessions = [],
  weekSets = [],
  mode = "sessions",
}) => {
  const weeklyActivity = useMemo(() => {
    const goalDays = profile?.time_for_week || 0;

    if (goalDays === 0) {
      return {
        trainedDays: 0,
        goalDays,
      };
    }

    const uniqueDays = new Set();

    for (const session of weekSessions) {
      if (!session?.startedAt) continue;
      uniqueDays.add(format(new Date(session.startedAt), "yyyy-MM-dd"));
    }

    if (mode === "sessions_and_sets") {
      for (const set of weekSets) {
        const raw = set?.created_at || set?.createdAt;
        if (!raw) continue;
        uniqueDays.add(format(new Date(raw), "yyyy-MM-dd"));
      }
    }

    return {
      trainedDays: Math.min(uniqueDays.size, goalDays),
      goalDays,
    };
  }, [profile?.time_for_week, weekSessions, weekSets, mode]);

  return (
    <div className="flex flex-col mt-5 center mx-4">
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
