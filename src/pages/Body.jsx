import Card from "../components/Card/Card";
import Button from "../components/Button/Button";
import ExpandArrowIcon from "../components/icons/ExpandArrowIcon";
import { useBody, useProgress } from "../hooks/queries/useBody";
import { useRegisterWeight } from "../hooks/mutations/useBodyMutations";
import { useAuth } from "../hooks/queries/useAuth";

export default function Body() {
  const { data } = useAuth();
  const profile_id = data?.profile_id;
  const {
    data: weightHistory = [],
    isLoading: isLoadingWeight,
    isError: isErrorWeight,
  } = useBody(profile_id);

  const {
    data: progressData = [],
    isLoading: isLoadingProgress,
    isError: isErrorProgress,
  } = useProgress(profile_id);

  const { mutate: registerWeight, isPending: isRegisteringWeight } =
    useRegisterWeight(profile_id);

  const isLoading = isLoadingWeight || isLoadingProgress;
  const isError = isErrorWeight || isErrorProgress;

  const currentWeight = weightHistory[0]?.weight ?? 0;
  const previousWeight = weightHistory[1]?.weight ?? currentWeight;

  const diff = currentWeight - previousWeight;

  const weightData = {
    current: currentWeight,
    trend: `${diff > 0 ? "+" : ""}${diff} kg`,
    isPositive: diff >= 0,
  };

  const weeklyProgress = [
    { day: "L", value: 0 },
    { day: "M", value: 0 },
    { day: "M", value: 0 },
    { day: "J", value: 0 },
    { day: "V", value: 0 },
    { day: "S", value: 0 },
    { day: "D", value: 0 },
  ];

  progressData.forEach((item) => {
    const date = new Date(item.created_at);
    const dayIndex = date.getDay();

    const mapDay = {
      1: 0,
      2: 1,
      3: 2,
      4: 3,
      5: 4,
      6: 5,
      0: 6,
    };

    const index = mapDay[dayIndex];

    if (index !== undefined) {
      weeklyProgress[index].value = item.weight;
    }
  });

  const maxWeight = Math.max(...weeklyProgress.map((item) => item.value), 1);

  const weeklyProgressNormalized = weeklyProgress.map((item) => ({
    ...item,
    value: item.value > 0 ? (item.value / maxWeight) * 100 : 0,
  }));

  const muscleActivity = [
    { id: 1, name: "Pecho", percentage: 82, colorClass: "bg-karga-orange" },
    { id: 2, name: "Espalda", percentage: 64, colorClass: "bg-amber-500" },
    { id: 3, name: "Piernas", percentage: 78, colorClass: "bg-karga-orange" },
    { id: 4, name: "Hombros", percentage: 50, colorClass: "bg-zinc-500" },
  ];

  const handleRegisterWeight = () => {
    const value = window.prompt("Ingrese su peso actual");

    if (!value) return;

    const weight = Number(value);

    if (Number.isNaN(weight) || weight <= 0) {
      alert("Ingrese un peso válido");
      return;
    }

    registerWeight(weight);
  };

  return (
    <div className="flex flex-col w-full animate-fade-in">
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
      ) : isError ? (
        <div className="text-red-400 text-sm font-semibold p-4">
          Ocurrió un error al cargar el progreso físico.
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
                  <ExpandArrowIcon
                    className={`w-3.5 h-3.5 ${
                      weightData.isPositive
                        ? "text-green-400"
                        : "text-red-400 rotate-180"
                    }`}
                  />
                  {weightData.trend}
                </div>
              </div>

              <Button
                variant="primary"
                className="w-full py-3.5 text-sm"
                onClick={handleRegisterWeight}
                disabled={isRegisteringWeight}
              >
                {isRegisteringWeight ? "Registrando..." : "+ Registrar peso"}
              </Button>
            </Card>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase mb-2 pl-2">
              Progreso Semanal
            </span>

            <Card
              variant="default"
              className="p-6 h-40 flex items-end justify-between"
            >
              {weeklyProgressNormalized.map((day, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center gap-2 w-8 h-full"
                >
                  <div className="w-full flex-1 bg-white/5 rounded-md relative flex items-end overflow-hidden">
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

                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${muscle.colorClass}`}
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
