import Card from "../../components/Card/Card";
import Avatar from "../../components/Avatar/Avatar";
import ChevronIcon from "../../components/icons/ChevronIcon";
import Button from "../../components/Button/Button";

export default function FavoriteExercises({
  exercises,
  isLoading,
  onAddRoutine,
  onDeleteExercise
}) {
  return (
    <div className="flex flex-col mt-8">
      <h2 className="text-lg font-bold text-white mb-4">Mis Ejercicios</h2>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-t-karga-orange border-white/5 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {exercises?.map(({ name, id, muscle }) => (
            <div
              key={id}
              className="flex flex-row items-center gap-2 cursor-pointer transition-all"
            >
              <Card
                variant="default"
                onClick={() => onAddRoutine(id)}
                className="p-4 flex flex-row items-center gap-4 cursor-pointer hover:bg-white/5 active:scale-[0.98] transition-all min-w-0 flex-1"
              >
                <Avatar initial={name ? name.charAt(0) : '?'} size="md" />
                <div className="flex flex-col flex-1">
                  <span className="text-[15px] font-bold text-zinc-100 mb-0.5">
                    {name}
                  </span>
                  <span>{muscle + " "}</span>
                </div>
                <ChevronIcon className="w-5 h-5 text-zinc-600" direction="right" />
              </Card>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteExercise(id)}
              >
                eliminar
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
