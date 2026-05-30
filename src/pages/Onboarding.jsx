import { useState } from 'react';
import { useNavigate } from 'react-router';
import Button from '../components/Button/Button';
import { ArrowLeft, ArrowRight } from '../components/icons';

export default function Onboarding() {
  const navigate = useNavigate();
    
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [weeklyFrequency, setWeeklyFrequency] = useState(3);
  const [restTime, setRestTime] = useState(60);
  
  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => Math.max(1, prev - 1));

  const handleFinishOnboarding = () => {
    setIsSubmitting(true);

    const onboardingData = {
      weeklyFrequency,
      restTime,
    };
  
    console.log("Enviando datos a Supabase...", onboardingData);
  
    //delay falso
    setTimeout(() => {
      setIsSubmitting(false); 
      
      navigate('/sets'); 
    }, 3000); 
  };

  return (
    <div className="relative flex flex-col h-full min-h-[85vh] text-white overflow-hidden ">
      {/* CONTENIDO DINÁMICO DEL ONBOARDING */}
      <main className="relative z-20 flex-1 flex flex-col w-full max-w-md mx-auto px-6 py-8 min-h-0">
        
        {/* si está enviando los datos, mostramos la pantalla de transición */}
        {isSubmitting ? (
          <div className="flex flex-col flex-1 items-center justify-center text-center animate-fade-in gap-4">
            {/* Spinner animado nativo con Tailwind */}
            <div className="w-12 h-12 border-4 border-t-karga-orange border-white/10 rounded-full animate-spin mb-2" />
            
            <h2 className="text-2xl font-black text-white tracking-tight">
              Creando tu cuenta...
            </h2>
            <p className="text-zinc-400 text-sm font-medium max-w-xs">
              Estamos configurando tu motor de rendimiento personalizado.
            </p>
          </div>
        ) : (
          /* si no está cargando, renderizamos los pasos normales */
          <>
            {step === 1 && (
                <Step1
                    weeklyFrequency={weeklyFrequency}
                    setWeeklyFrequency={setWeeklyFrequency}
                    onNext={handleNext}
                    onBack={handleBack}
                    step={step}
                />
            )}
            
            {step === 2 && (
                <Step2
                    restTime={restTime}
                    setRestTime={setRestTime}
                    onNext={handleFinishOnboarding}
                    onBack={handleBack}
                    step={step}
                />
            )}
          </>
        )}
      </main>
    </div>
  );
}

//PASO 1: frecuencia semanal
function Step1({ 
    onNext, 
    onBack,
    step,
    weeklyFrequency, 
    setWeeklyFrequency 
  }) {
  
    const handleDecrement = () => setWeeklyFrequency((prev) => Math.max(1, prev - 1));
    const handleIncrement = () => setWeeklyFrequency((prev) => Math.min(7, prev + 1));
  
    return (
      <div className="flex flex-col flex-1 w-full animate-fade-in">
        
        <div className="flex flex-col mb-10">
          <span className="text-karga-orange font-bold text-xs tracking-widest uppercase mb-3">
            Paso 1 de 2
          </span>
          <h2 className="text-4xl font-black text-white tracking-tight mb-3">
            Establece tu frecuencia semanal
          </h2>
          <p className="text-zinc-400 text-sm font-medium">
            Ajusta el valor inicial para personalizar tu experiencia.
          </p>
        </div>
  
        {/*CONTADOR*/}
        <div className="flex flex-col items-center my-10">
          <div className="flex flex-col items-center gap-4">
              
              <div className="flex items-center gap-8 bg-white/5 p-6 rounded-[2rem] border border-white/5 shadow-inner">
              
                <button 
                    type="button"
                    onClick={handleDecrement}
                    className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white/5 text-karga-orange hover:bg-white/10 active:scale-95 transition-all text-3xl font-bold"
                >
                    <div className="-translate-y-[2px]">-</div>
                </button>
                
                <div className="w-24 text-center text-6xl font-black text-white tracking-tighter">
                    {weeklyFrequency}
                </div>

                <button 
                    type="button"
                    onClick={handleIncrement}
                    className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white/5 text-karga-orange hover:bg-white/10 active:scale-95 transition-all text-3xl font-bold"
                >
                    <div className="-translate-y-[3px] -translate-x-[-1px]">+</div>
                </button>
              
              </div>

              <span className="text-zinc-500 text-base font-semibold tracking-wide lowercase mt-1">
                {weeklyFrequency === 1 ? 'día por semana' : 'días por semana'}
              </span>

      {/*  CONTADOR */}
      <div className="flex flex-col items-center my-10">
        <div className="flex items-center gap-8 bg-white/5 p-6 rounded-4xl border border-white/5 shadow-inner">
          <button
            type="button"
            onClick={handleDecrement}
            className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white/5 text-karga-orange hover:bg-white/10 active:scale-95 transition-all text-3xl font-bold"
          >
            <div className="-translate-y-0.5">-</div>
          </button>

          <div className="w-24 text-center text-6xl font-black text-white tracking-tighter">
            {weeklyFrequency}
          </div>

          <button
            type="button"
            onClick={handleIncrement}
            className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white/5 text-karga-orange hover:bg-white/10 active:scale-95 transition-all text-3xl font-bold"
          >
            <div className="-translate-y-0.75 -translate-x-px">+</div>
          </button>
          </div>
        </div>
  
        {/* BOTONES Y FOOTER */}
        <div className="mt-auto translate-y-4 pt-4 w-full flex flex-col gap-6">

          <div className="flex items-center gap-3 w-full">
            {step > 1 && (
                <div className="w-1/4">
                  <Button variant="secondary" size="lg" onClick={onBack} className="w-full">
                      <ArrowLeft className="text-zinc-500"/>
                  </Button>
                </div>
            )}

            <div className={step > 1 ? "w-3/4" : "w-full"}>
                <Button variant="primary" size="lg" onClick={onNext} className="w-full group">
                  <span>Siguiente</span>
                  <ArrowRight className="w-6 h-5 inline-block transition-all duration-300 group-hover:translate-x-1" />
                </Button>
            </div>
          </div>

          <div className="w-full flex flex-col items-center pb-6">
            <p className="mt-4 text-xs text-zinc-400 font-medium tracking-wide">
                Podrás cambiar estos ajustes luego.
            </p>
          </div>

        </div>
        
      </div>
    );
}

// PASO 2: tiempo de descanso 
function Step2({ 
    onNext, 
    onBack,
    step,
    restTime, 
    setRestTime 
  }) {
  
    //minimo es 30 y no hay maximo
    const handleDecrement = () => setRestTime((prev) => Math.max(30, prev - 30));
    const handleIncrement = () => setRestTime((prev) => prev + 30);
  
    // formateador visual para que 60s = 1m y asi
    const formatTime = (totalSeconds) => {
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}:${seconds === 0 ? '00' : seconds}`;
    };

    return (
      <div className="flex flex-col flex-1 w-full animate-fade-in">
        
        <div className="flex flex-col mb-10">
          <span className="text-karga-orange font-bold text-xs tracking-widest uppercase mb-3">
            Paso 2 de 2
          </span>
          <h2 className="text-4xl font-black text-white tracking-tight mb-3">
            Tiempo de descanso
          </h2>
          <p className="text-zinc-400 text-sm font-medium">
            Define tu pausa predeterminada entre cada set.
          </p>
        </div>
  
        {/*CONTADOR DE TIEMPO*/}
        <div className="flex flex-col items-center my-10">
          <div className="flex flex-col items-center gap-4">
              
              <div className="flex items-center gap-8 bg-white/5 p-6 rounded-[2rem] border border-white/5 shadow-inner">
              
                <button 
                    type="button"
                    onClick={handleDecrement}
                    className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white/5 text-karga-orange hover:bg-white/10 active:scale-95 transition-all text-3xl font-bold"
                >
                    <div className="-translate-y-[2px]">-</div>
                </button>
                
                {/*  formato reloj */}
                <div className="w-32 text-center text-6xl font-black text-white tracking-tighter">
                    {formatTime(restTime)}
                </div>

                <button 
                    type="button"
                    onClick={handleIncrement}
                    className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white/5 text-karga-orange hover:bg-white/10 active:scale-95 transition-all text-3xl font-bold"
                >
                    <div className="-translate-y-[3px] -translate-x-[-1px]">+</div>
                </button>
              
              </div>

              <span className="text-zinc-500 text-base font-semibold tracking-wide lowercase mt-1">
                minuto(s)
              </span>

          </div>
        </div>
  
        {/* BOTONES Y FOOTER */}
        <div className="mt-auto translate-y-4 pt-4 w-full flex flex-col gap-6">

          <div className="flex items-center gap-3 w-full">
            {step > 1 && (
                <div className="w-1/4">
                  <Button variant="secondary" size="lg" onClick={onBack} className="w-full flex justify-center">
                      <ArrowLeft className="text-zinc-500 w-6 h-6"/>
                  </Button>
                </div>
            )}

            <div className={step > 1 ? "w-3/4" : "w-full"}>
                <Button variant="primary" size="lg" onClick={onNext} className="w-full group">
                  <span>Finalizar</span>
                </Button>
            </div>
          </div>

          <div className="w-full flex flex-col items-center pb-6">
            <p className="mt-4 text-xs text-zinc-400 font-medium tracking-wide">
                Podrás cambiar estos ajustes luego.
            </p>
          </div>

        </div>
        
      </div>
    );
}
