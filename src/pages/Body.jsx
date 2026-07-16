import { useMemo, useState } from "react";
import Card from "../components/Card/Card";
import Button from "../components/Button/Button";
import ExpandArrowIcon from "../components/icons/ExpandArrowIcon";
import { useAuth } from "../hooks/queries/useAuth";
import { useSets } from "../hooks/queries/useSets";
import { useRegisterWeight } from "../hooks/mutations/useBodyMutations";
import { useWeight } from "../hooks/queries/useBody";
import WeightChart from "../components/WeightChart";
import { getCachedProfile } from "../storage/profile-storage";
export default function Body() {

  const profile = getCachedProfile()
  const profile_id = profile?.profile_id;

  const { data: weight, isLoading: isWeightLoading } = useWeight(
    profile_id
  );

  const { data: sets = [], isLoading: isSetsLoading } = useSets(profile_id);

  const { mutateAsync: registerWeight, isPending: isRegisteringWeight } =
    useRegisterWeight(profile_id);

  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [newWeight, setNewWeight] = useState("");

  const isLoading = isSetsLoading || isWeightLoading;

  const muscleActivity = useMemo(() => {
    const muscleCounter = {};

    sets.forEach((set) => {
      const muscles = set.exercises?.muscle;

      if (!Array.isArray(muscles)) return;

      muscles.forEach((muscle) => {
        muscleCounter[muscle] = (muscleCounter[muscle] || 0) + 1;
      });
    });

    const maxValue = Math.max(...Object.values(muscleCounter), 1);

    return Object.entries(muscleCounter)
      .map(([name, value], index) => ({
        id: index + 1,
        name,
        percentage: Math.round((value / maxValue) * 100),
        colorClass:
          index % 3 === 0
            ? "bg-karga-orange"
            : index % 3 === 1
              ? "bg-amber-500"
              : "bg-zinc-500",
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }, [sets]);

  const weightData = useMemo(() => {
    if (!weight || weight.length === 0) {
      return {
        current: profile?.weight || 0,
        trend: "Primer registro",
        type: "neutral",
      };
    }

    const orderedWeights = [...weight].sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at),
    );

    const lastWeight = orderedWeights[orderedWeights.length - 1];
    const previousWeight = orderedWeights[orderedWeights.length - 2];

    const current = Number(lastWeight?.weight || profile?.weight || 0);

    if (!previousWeight) {
      return {
        current,
        trend: "Primer registro",
        type: "neutral",
      };
    }

    const previous = Number(previousWeight.weight);
    const diff = current - previous;

    if (diff === 0) {
      return {
        current,
        trend: "Sin cambios",
        type: "neutral",
      };
    }

    return {
      current,
      trend: `${diff > 0 ? "+" : ""}${diff.toFixed(1)} kg`,
      type: diff > 0 ? "up" : "down",
    };
  }, [weight, profile?.weight]);

  const handleRegisterWeight = () => {
    setNewWeight(profile?.weight || "");
    setIsWeightModalOpen(true);
  };

  const handleSubmitWeight = async () => {
    if (!profile_id) return;
    if (!newWeight) return;

    await registerWeight({
      weight: Number(newWeight),
    });

    setNewWeight("");
    setIsWeightModalOpen(false);
  };

  return (
    <div className="flex flex-col w-full animate-fade-in px-4">
      
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

                <div
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                    weightData.isPositive
                      ? "bg-green-500/15 text-green-400"
                      : "bg-red-500/15 text-red-400"
                  }`}
                >
                  <ExpandArrowIcon />
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

          <div className="flex flex-col align-center">
            <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase mb-2 pl-1">
              Gráfica de peso
            </span>

            <WeightChart data={weight} />
          </div>

          <div className="flex flex-col mb-4">
            <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase mb-2 pl-2">
              Actividad Muscular
            </span>

            <div className="flex flex-col gap-2">
              {muscleActivity.length === 0 ? (
                <Card variant="default" className="p-4">
                  <p className="text-sm text-zinc-400">
                    Todavía no hay actividad muscular registrada.
                  </p>
                </Card>
              ) : (
                muscleActivity.map((muscle) => (
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

                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${muscle.colorClass}`}
                        style={{ width: `${muscle.percentage}%` }}
                      />
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {isWeightModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-karga-gray text-white rounded-2xl p-5 w-full max-w-sm border border-white/10 space-y-4">
            <h2 className="text-2xl font-black">Registrar peso</h2>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-zinc-300">Nuevo peso</label>

              <input
                type="number"
                step="0.1"
                placeholder="Ej: 72.4"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="bg-black/30 border border-white/10 rounded-xl p-3 text-white outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsWeightModalOpen(false)}
                className="flex-1 bg-white/10 rounded-xl p-3"
              >
                Cancelar
              </button>

              <button
                onClick={handleSubmitWeight}
                disabled={isRegisteringWeight}
                className="flex-1 bg-karga-orange rounded-xl p-3 font-bold disabled:opacity-50"
              >
                {isRegisteringWeight ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
