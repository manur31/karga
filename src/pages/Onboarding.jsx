import { useState } from 'react';
import Button from '../components/Button/Button';
import { ArrowLeft, ArrowRight } from '../components/icons';

export default function Onboarding() {
    
  const [step, setStep] = useState(1);
  const [weeklyFrequency, setWeeklyFrequency] = useState(3);
  // para avanzar y retroceder
  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => Math.max(1, prev - 1));

  return (
    <div className="relative flex flex-col h-full min-h-[85vh] text-white overflow-hidden ">
      
      {/* CONTENIDO DINÁMICO DEL ONBOARDING */}
      <main className="relative z-20 flex-1 flex flex-col w-full max-w-md mx-auto px-6 py-8 min-h-0">
        
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
        <div className="flex flex-1 items-center justify-center text-center animate-fade-in">
            <h2 className="text-2xl font-bold text-zinc-400">
            Página: Seteo de tiempo entre sets — en construcción 🚧 <n />Paciencia🙏❤️ ajsjasj
            </h2>
        </div>
        )}
      </main>

    </div>
  );
}

function Step1({ 
    onNext, 
    onBack,
    step,
    weeklyFrequency, 
    setWeeklyFrequency 
  }) {
  
    const handleDecrement = () =>
        setWeeklyFrequency((prev) => Math.max(1, prev - 1));
      
      const handleIncrement = () =>
        setWeeklyFrequency((prev) => Math.min(7, prev + 1));
  
    return (
      <div className="flex flex-col flex-1 w-full animate-fade-in">
        
        <div className="flex flex-col mb-10">
          <span className="text-karga-orange font-bold text-xs tracking-widest uppercase mb-3">
            Paso 1 de 2
          </span>
          <h2 className="text-4xl font-black text-white tracking-tight mb-3">
            Establece tu frecuencia semanal
          </h2>
          <p className="text-zinc-400 text-sm font-small">
            Ajusta el valor inicial para personalizar tu experiencia.
          </p>
        </div>
  
        {/*  CONTADOR */}
        <div className="flex flex-col items-center my-10">
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
        </div>
  
        {/* BOTONES Y FOOTER */}
    <div className="mt-auto translate-y-4 pt-4 w-full flex flex-col gap-6">

    {/* FILA DE BOTONES */}
    <div className="flex items-center gap-3 w-full">

    {/* BOTÓN VOLVER */}
    {step > 1 && (
        <div className="w-1/4">
        <Button
            variant="secondary"
            size="lg"
            onClick={onBack}
            className="w-full"
        >
            <ArrowLeft className="text-zinc-500"/>
        </Button>
        </div>
    )}

    {/* BOTÓN D SIGUIENTE */}
    <div className={step > 1 ? "w-3/4" : "w-full"}>
        <Button
        variant="primary"
        size="lg"
        onClick={onNext}
        className="w-full"
        >
        <span>Siguiente</span>

        <ArrowRight viewBox="0 -1.5 23 24"/>

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

    const handleFinishOnboarding = async () => {
        const onboardingData = {
          weeklyFrequency,
        };
      
        console.log(onboardingData);
      
        //falta integrar la persistencia con el supa
      };
  }

  