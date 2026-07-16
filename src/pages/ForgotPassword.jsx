import { useNavigate } from "react-router";
import Button from "../components/Button/Button";
import { Mancuerna } from "../components/icons";

export default function ForgotPassword() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-dark-bg flex flex-col items-center justify-center px-6 py-12 select-none animate-fade-in">
      <div className="flex flex-col items-center max-w-sm text-center">
        {/* ILUSTRACIÓN CARICATURESCA */}
        <div className="relative mb-8">
          {/* Círculo de brillo de fondo */}
          <div className="absolute inset-0 bg-karga-orange/10 blur-3xl rounded-full scale-125 animate-pulse" />
          
          {/* Mancuerna rota/caída */}
          <div className="relative flex items-center justify-center w-32 h-32 bg-white/5 border border-white/10 rounded-full shadow-2xl">
            <Mancuerna className="w-16 h-16 text-zinc-600 rotate-45 transform translate-y-2 opacity-80" />
            
            {/* Gotas de sudor / Exclamaciones */}
            <span className="absolute top-6 right-6 text-2xl animate-bounce">💦</span>
            <span className="absolute bottom-6 left-6 text-2xl animate-bounce delay-150">⚠️</span>
          </div>
        </div>

        {/* TÍTULO */}
        <h1 className="text-4xl font-black text-white tracking-tight leading-none mb-4">
          ¡Ups! Ocurrió un error
        </h1>

        {/* MENSAJE DIVERTIDO */}
        <p className="text-zinc-400 text-sm font-medium leading-relaxed mb-8 px-2">
          Parece que esta sección se fue a hacer <span className="text-karga-orange font-bold">cardio</span>... y como odiamos el cardio, todavía no sabemos cuándo va a volver.
        </p>

        {/* BOTÓN REGRESAR */}
        <Button
          onClick={() => navigate("/login")}
          variant="primary"
          size="lg"
          className="w-full relative overflow-hidden transition-all duration-300 hover:drop-shadow-[0_0_8px_var(--color-karga-orange)] hover:shadow-karga-orange/10 active:scale-[0.98]"
        >
          Volver al Login
        </Button>
      </div>
    </div>
  );
}
