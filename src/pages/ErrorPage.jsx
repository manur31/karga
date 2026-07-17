import { useNavigate } from "react-router";
import Button from "../components/Button/Button";
import { Mancuerna } from "../components/icons";

export default function ErrorPage({ 
  title = "¡Ups! Ocurrió un error",
  message = (
    <>
      Esta sección sufrió de <span className="text-karga-orange font-bold">sobreentrenamiento</span> y está en su día de descanso obligado. Intenta regresar cuando se recupere.
    </>
  ),
  redirectTo = -1,
  suffix = ""
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (redirectTo === -1) {
      if (window.history.state && window.history.state.idx > 0) {
        navigate(-1);
      } else {
        navigate("/");
      }
    } else {
      navigate(redirectTo);
    }
  };

  return (
    <div className="min-h-screen w-full bg-dark-bg flex flex-col items-center justify-center px-6 py-12 select-none animate-fade-in">
      <div className="flex flex-col items-center max-w-sm text-center">
        
        <div className="relative mb-8">
          
          <div className="absolute inset-0 bg-karga-orange/10 blur-3xl rounded-full scale-125 animate-pulse" />
          
          
          <div className="relative flex items-center justify-center w-32 h-32 bg-white/5 border border-white/10 rounded-full shadow-2xl">
            <Mancuerna className="w-16 h-16 text-zinc-600 rotate-45 transform translate-y-2 opacity-80" />
            
            <span className="absolute top-6 right-6 text-2xl animate-bounce">💦</span>
            <span className="absolute bottom-6 left-6 text-2xl animate-bounce delay-150">⚠️</span>
          </div>
        </div>

        {/* TÍTULO */}
        <h1 className="text-4xl font-black text-white tracking-tight leading-none mb-4">
          {title}
        </h1>
        
        {/* MENSAJE */}
        <p className="text-zinc-400 text-sm font-medium leading-relaxed mb-8 px-2">
          {message}
        </p>

        {/* BOTÓN REGRESAR */}
        <Button
          onClick={handleBack}
          variant="primary"
          size="lg"
          className="w-full relative overflow-hidden transition-all duration-300 hover:drop-shadow-[0_0_8px_var(--color-karga-orange)] hover:shadow-karga-orange/10 active:scale-[0.98]"
        >
          Volver{suffix}
        </Button>
      </div>
    </div>
  );
}
