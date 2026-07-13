import { useState } from 'react';
import { useNavigate } from 'react-router';
import Button from '../components/Button/Button';
import Input from '../components/Input/Input';
import { ArrowLeft, ArrowRight } from '../components/icons';
import { useOnboarding } from '../hooks/mutations/useAuthMutations';
import { useWeightUnit } from '../hooks/useWeightUnit';
import { useForm } from "react-hook-form";
import { onboardingSchema } from "../lib/schemas/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    setValue, //inyectar valores a mano sin usar <input>
    getValues, //obtener valores para convertirlos manualmente
    watch,    //mirar en tiempo real cuánto vale una variable
    trigger,  //forzar la validación de un paso antes de avanzar
    formState: { errors },
  } = useForm({
    resolver: zodResolver(onboardingSchema),
    mode: "onSubmit",
    defaultValues: {
      weeklyFrequency: 3,
      restTime: 60,
      weight: "", 
    }
  });

  const weeklyFrequency = watch("weeklyFrequency");
  const restTime = watch("restTime");

  const { convertToKg } = useWeightUnit();

  const { mutate: onboardingMutate, isPending } = useOnboarding();

  const handleNext = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (step === 3) { 
      const isWeightValid = await trigger("weight");
      if (!isWeightValid) return;
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => setStep((prev) => Math.max(1, prev - 1));

  const onSubmit = (data) => {
    const onboardingData = {
      size: 181,
      time_for_week: data.weeklyFrequency,
      weight: convertToKg(data.weight),
      rest_time: data.restTime,
    };
  
    onboardingMutate(onboardingData, {
      onSuccess: () => navigate('/rutinas')
    });
  };

  return (
    <div className="relative flex flex-col h-full min-h-[85vh] text-white overflow-hidden ">
      <main className="relative z-20 flex-1 flex flex-col w-full max-w-md mx-auto px-6 py-8 min-h-0">
        
        {isPending ? (
          <div className="flex flex-col flex-1 items-center justify-center text-center animate-fade-in gap-4">
            <div className="w-12 h-12 border-4 border-t-karga-orange border-white/10 rounded-full animate-spin mb-2" />
            <h2 className="text-2xl font-black text-white tracking-tight">Creando tu cuenta...</h2>
            <p className="text-zinc-400 text-sm font-medium max-w-xs">

              Estamos configurando tu motor de rendimiento personalizado.

            </p>
          </div>
        ) : (
          
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1">
            
            <div className="flex-1">
              {step === 1 && (
                <Step1
                  weeklyFrequency={weeklyFrequency}
                  setValue={setValue}
                />
              )}
              
              {step === 2 && (
                <Step2
                  restTime={restTime}
                  setValue={setValue}
                />
              )}

              {step === 3 && (
                <Step3
                  register={register}
                  errors={errors}
                  setValue={setValue}
                  getValues={getValues}
                />
              )}
            </div>

            {/* FOOTER */}
            <div className="mt-auto translate-y-4 pt-4 w-full flex flex-col gap-6">
              <div className="flex items-center gap-3 w-full">
                {step > 1 && (
                  <div className="w-1/4">
                    <Button type="button" variant="secondary" size="lg" onClick={handleBack} className="w-full flex justify-center">
                        <ArrowLeft className="text-zinc-500 w-6 h-6"/>
                    </Button>
                  </div>
                )}

                <div className={step > 1 ? "w-3/4" : "w-full"}>
                  {step < 3 ? (
                    <Button key="btn-next" type="button" variant="primary" size="lg" onClick={handleNext} className="w-full group">
                      <span>Siguiente</span>
                      <ArrowRight className="w-6 h-5 inline-block transition-all duration-300 group-hover:translate-x-1" />
                    </Button>
                  ) : (
                    <Button key="btn-submit" type="submit" variant="primary" size="lg" className="w-full group">
                      <span>Finalizar</span>
                    </Button>
                  )}
                </div>
              </div>

              <div className="w-full flex flex-col items-center pb-6">
                <p className="mt-4 text-xs text-zinc-400 font-medium tracking-wide">
                    Podrás cambiar estos ajustes luego.
                </p>
              </div>
            </div>

          </form>
        )}
      </main>
    </div>
  );
}

// STEPS

function Step1({ weeklyFrequency, setValue }) {
  
  const handleDecrement = () => setValue("weeklyFrequency", Math.max(1, weeklyFrequency - 1));
  const handleIncrement = () => setValue("weeklyFrequency", Math.min(7, weeklyFrequency + 1));

  return (
    <div className="flex flex-col w-full animate-fade-in">
      <div className="flex flex-col mb-10">
        <span className="text-karga-orange font-bold text-xs tracking-widest uppercase mb-3">Paso 1 de 3</span>
        <h2 className="text-4xl font-black text-white tracking-tight mb-3">Establece tu frecuencia semanal</h2>
        <p className="text-zinc-400 text-sm font-medium">
            Ajusta el valor inicial para personalizar tu experiencia.
        </p>
      </div>

      <div className="flex flex-col items-center my-10">
        <div className="flex items-center gap-8 bg-white/5 p-6 rounded-4xl border border-white/5 shadow-inner">
          <button type="button" onClick={handleDecrement} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white/5 text-karga-orange hover:bg-white/10 active:scale-95 transition-all text-3xl font-bold">
            -
          </button>
          <div className="w-24 text-center text-6xl font-black text-white tracking-tighter">
            {weeklyFrequency}
          </div>
          <button type="button" onClick={handleIncrement} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white/5 text-karga-orange hover:bg-white/10 active:scale-95 transition-all text-3xl font-bold">
            +
          </button>
        </div>
        <span className="text-zinc-500 text-base font-semibold tracking-wide lowercase mt-2">
            {weeklyFrequency === 1 ? 'día por semana' : 'días por semana'}
        </span>
      </div>
    </div>
  );
}

function Step2({ restTime, setValue }) {
  const handleDecrement = () => setValue("restTime", Math.max(30, restTime - 30));
  const handleIncrement = () => setValue("restTime", restTime + 30);

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds === 0 ? '00' : seconds}`;
  };

  return (
    <div className="flex flex-col w-full animate-fade-in">
      <div className="flex flex-col mb-10">
        <span className="text-karga-orange font-bold text-xs tracking-widest uppercase mb-3">Paso 2 de 3</span>
        <h2 className="text-4xl font-black text-white tracking-tight mb-3">Tiempo de descanso</h2>
        <p className="text-zinc-400 text-sm font-medium">
            Define tu pausa predeterminada entre cada set.
        </p>
      </div>

      <div className="flex flex-col items-center my-10">
        <div className="flex items-center gap-8 bg-white/5 p-6 rounded-4xl border border-white/5 shadow-inner">
          <button type="button" onClick={handleDecrement} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white/5 text-karga-orange hover:bg-white/10 active:scale-95 transition-all text-3xl font-bold">
            -
          </button>
          <div className="w-32 text-center text-6xl font-black text-white tracking-tighter">
            {formatTime(restTime)}
          </div>
          <button type="button" onClick={handleIncrement} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white/5 text-karga-orange hover:bg-white/10 active:scale-95 transition-all text-3xl font-bold">
            +
          </button>
        </div>
        <span className="text-zinc-500 text-base font-semibold tracking-wide lowercase mt-1">minuto(s)</span>
      </div>
    </div>
  );
}

function Step3({ register, errors, setValue, getValues }) {
  const { unit, toggleUnit } = useWeightUnit();

  const handleToggle = () => {
    const currentVal = getValues("weight");
    if (currentVal && !isNaN(currentVal)) {
      if (unit === 'kg') {
        setValue("weight", Number((currentVal * 2.20462).toFixed(1)));
      } else {
        setValue("weight", Number((currentVal / 2.20462).toFixed(1)));
      }
    }
    toggleUnit();
  };

  return (
    <div className="flex flex-col w-full animate-fade-in">
      <div className="flex flex-col mb-10">
        <span className="text-karga-orange font-bold text-xs tracking-widest uppercase mb-3">
          Paso 3 de 3
        </span>
        <h2 className="text-4xl font-black text-white tracking-tight mb-3">
          ¿Cuál es tu peso?
        </h2>
        <p className="text-zinc-400 text-sm font-medium">
          Podrás registrar tu avance corporal.
        </p>
      </div>

      <div className="flex flex-col items-center my-10 gap-2 w-full">
        <div className="flex items-center justify-center relative w-full max-w-50">
          <Input 
            type="number" 
            step="0.1" 
            placeholder="0.0"
            className="text-center text-4xl font-black pr-12 h-24 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            //para q no se pueda ingresar negativo ni boludeces
            onKeyDown={(e) => {
              if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                e.preventDefault();
              }
            }}

            /* 3. REGISTRO LIMPIO:
              Sacamos el trigger automático del onChange para que NO se ponga rojo de entrada.
              Ahora solo validará cuando el usuario salga del input o intente darle a Finalizar.
            */
            {...register("weight")} 
          />
          <button 
            type="button"
            onClick={handleToggle}
            className="absolute right-4 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-400 hover:text-white font-bold text-sm uppercase transition-all active:scale-95 border border-white/5"
          >
            {unit}
          </button>
        </div>
        
        {/* El cartel de error solo aparecerá si realmente hay un error confirmado */}
        {errors.weight && (
          <span className="text-red-500 text-sm font-semibold mt-2">
            {errors.weight.message}
          </span>
        )}
      </div>
    </div>
  );
}