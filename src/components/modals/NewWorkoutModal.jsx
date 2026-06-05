import { useForm } from "react-hook-form"
import Input from '../Input/Input'
import { ArrowLeft, PlusIcon, CheckIcon } from '../icons/index';
import { useExercises } from "../../hooks/queries/useExercises";
import { useCreateRoutines } from "../../hooks/mutations/useRoutinesMutation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { routineSchema } from "../../lib/schemas/routineSchema";

function NewWorkoutModal({ onClose, isOpen }) {
    const { data: exercises, isLoading, isError, isSuccess } = useExercises();
    const { mutate: createRoutines } = useCreateRoutines();
    const [isClosing, setIsClosing] = useState(false);
    const [step, setStep] = useState(1);
    const [selectedExercises, setSelectedExercises] = useState([]);

    const {
        register,
        handleSubmit,
        formState: { errors },  
    } = useForm({
        resolver: zodResolver(routineSchema),
        mode: 'all'
    })

    const handleNext = () => {
        setStep((prev) => prev + 1);
    }

    const handleToggleExercise = (exerciseId) => {
        setSelectedExercises((prev) => 
        prev.includes(exerciseId) 
            ? prev.filter(id => id !== exerciseId)
            : [...prev, exerciseId]
        );
    };

    const handleCloseWithAnimation = () => {
        if (step === 2) {
            setStep(1);
            setSelectedExercises([]);
            return;
        }
        setIsClosing(true); 
        setTimeout(() => {
        onClose();
        }, 300);
    };

    const handleModal = () => {
        setIsClosing(!isClosing);
        setTimeout(() => {
            onClose();
        }, 200);
    };

    const handleSaveRoutine = (data) => {
        console.log(data);
        createRoutines(data);
        if (isSuccess) {
            handleNext();
        }
    }

  return (
    <div className="fixed top-0 bottom-19 left-1/2 -translate-x-1/2 w-full max-w-md z-40 flex flex-col overflow-hidden pointer-events-none">
    <section className={`w-full h-screen rounded-2xl overflow-hidden flex flex-col relative bg-dark-bg pointer-events-auto ${
        isClosing ? 'animate-slide-out-down' : 'animate-slide-in-up'
      }`}>
        <div className="flex items-center justify-between p-5 bg-input-bg shrink-0 z-20">
            <button onClick={handleCloseWithAnimation} className="p-1.5 text-zinc-400 hover:text-white transition-colors">
                <ArrowLeft className="w-6 h-6" />
            </button>
            <span className="text-lg font-black text-white tracking-tight">
                {step === 1 ? 'Nuevo Workout' : 'Selecciona ejercicios'}
            </span>
            <button 
            onClick={handleNext}
            type="button"
            disabled={(selectedExercises.length === 0 && step === 2)}
            className="text-karga-orange font-bold text-sm px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
            {step === 1 ? 'Siguiente' : 'Guardar'}
            </button>
        </div>
        {step === 1 && (
            <form onSubmit={handleSubmit(handleSaveRoutine)} className="flex flex-col gap-4 mt-4 px-4">
                <div className="flex flex-col gap-2 my-2">
                    <label htmlFor="name" className="text-white">Name</label>
                    <Input {...register('name')} />
                </div>
                {errors.name && <p className="text-red-500">{errors.name.message}</p>}
                <div className="flex flex-col gap-2 my-2">
                    <label htmlFor="description" className="text-white">description</label>
                    <textarea className="w-full rounded-2xl p-4 bg-input-bg text-white placeholder-zinc-500 font-medium transition-all outline-none border border-white/5 focus:border-karga-orange focus:ring-4 focus:ring-karga-orange/20" {...register('description')} name="description" id="description"></textarea>
                    {errors.description && <p className="text-red-500">{errors.description.message}</p>}
                </div>
                <button type="submit">
                    {isLoading ? 'Loading...' : 'Submit'}
                </button>
            </form>
        )}

        {step === 2 && (
            <section className="flex-1 overflow-y-auto py-4 px-2">
            <h3 className="text-lg font-bold text-white mb-4">Exercises</h3>
            <div className="flex flex-col">
                { exercises.map((exercise) => (
                    <div key={exercise.id} className="flex items-center gap-2 ">
                        <button onClick={() => handleToggleExercise(exercise.id)}>
                            {selectedExercises.includes(exercise.id) ? <CheckIcon /> : <PlusIcon/>}
                        </button>
                        <div className="flex items-center border-t border-white/10 w-full py-2">
                            <h3>{exercise.name}</h3>
                            <p>{exercise.description}</p>
                        </div>
                    </div>
                ))}
            </div>
            </section>
        )}
    </section>
    </div>
  )
}

export default NewWorkoutModal