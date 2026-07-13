import { Navigate, useNavigate } from 'react-router';
import Button from '../components/Button/Button';
import bgGym from '../assets/istockphoto-1069260156-612x612.jpg';
import { Mancuerna } from '../components/icons';
import ArrowRight from '../components/icons/ArrowRight.jsx';
import { useAuth } from '../hooks/queries/useAuth.js';

export default function Welcome() {
  const navigate = useNavigate();

  const { data: profile, isLoading } = useAuth()
  
  if (isLoading) return <div>Loading...</div>
  if (profile) return <Navigate to={"/rutinas"} />;

  return (
    <div className="relative flex flex-col justify-between items-center min-h-[85vh] w-full text-center px-4 py-8 overflow-hidden">
      
      <div className="fixed inset-0 z-0 pointer-events-none select-none">
        <img 
          src= {bgGym}
          alt="Background" 
          className="w-full h-full object-cover opacity-[0.15] filter grayscale"
        />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-dark-bg/50 to-dark-bg" />

      </div>

      {/* logo */}
      <div className="relative z-10 flex flex-col items-center mt-12 w-full ">
        <Mancuerna className="w-16 h-16 text-karga-orange mb-4" />

        <h1 className="text-7xl font-black tracking-tight text-karga-lightorange drop-shadow-[0_0_16px_rgba(255,168,130,0.25)]">
          Karga
        </h1>
        
        <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-400 font-bold mt-4">
          Peak Performance Engine
        </p>
      </div>

      {/* slogan */}
      <div className="relative z-10 flex flex-col items-center gap-4 my-auto max-w-xs">
        <p className="text-lg font-medium text-zinc-200">
          Define tus límites. Supéralos todos.
        </p>
        <div className="w-12 h-0.75 bg-[#FF5C00] rounded-full" />
      </div>

      {/* botones y footer */}
      <div className="relative z-10 w-full flex flex-col gap-4 max-w-sm mt-auto">
        
        <Button 
          variant="primary" 
          size="lg" 
          onClick={() => navigate('/register')}
          className="group"
        >
          <span>Empezar</span>
          <ArrowRight className="w-6 h-5 inline-block transition-all duration-300 group-hover:translate-x-1" />
        
        </Button>
        
        <Button 
          variant="secondary" 
          size="lg" 
          onClick={() => navigate('/login')}
        >
          Iniciar sesión
        </Button>

        <p className="text-[9px] uppercase tracking-widest text-zinc-600 font-semibold mt-8">
          By Athletes for Athletes • v2.4.0
        </p>
      </div>

    </div>
  );
}