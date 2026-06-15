import { FiX, FiLogOut, FiSettings, FiUser, FiInfo } from 'react-icons/fi';
import { useAuth } from '../../hooks/queries/useAuth';
import { useSettingsStore } from '../../stores/settingsStore';
import { logout } from '../../service/authService';

export default function ProfileModal({ isOpen, onClose }) {
  const { data: user } = useAuth();
  const { weightUnit, setWeightUnit } = useSettingsStore();

  if (!isOpen) return null;

  const handleLogout = async () => {
    await logout();
    window.location.href = '/welcome';
  };

  return (
    <div className="fixed inset-0 z-[100] bg-karga-gray flex flex-col animate-fade-in">
      <div className="flex items-center justify-between px-4 pt-6 pb-4 border-b border-white/5">
        <h2 className="text-white text-xl font-bold">Perfil y Ajustes</h2>
        <button onClick={onClose} className="p-2 text-white/50 hover:text-white">
          <FiX size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-8 pb-24">
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-[#2A2424] flex items-center justify-center border border-white/10">
            <FiUser size={40} className="text-white/20" />
          </div>
          <div className="text-center">
            <h3 className="text-white font-bold text-lg">{user?.name || "Usuario Karga"}</h3>
            <p className="text-white/40 text-sm">{user?.email || "usuario@ejemplo.com"}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h4 className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2 pl-1">Preferencias</h4>
          
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
            <div className="flex items-center gap-3">
              <FiSettings className="text-karga-orange" size={20} />
              <span className="text-white font-medium">Unidad de Peso</span>
            </div>
            <div className="flex bg-black/40 rounded-xl p-1">
              <button 
                onClick={() => setWeightUnit('kg')}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${weightUnit === 'kg' ? 'bg-karga-orange text-white' : 'text-white/40'}`}
              >
                KG
              </button>
              <button 
                onClick={() => setWeightUnit('lb')}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${weightUnit === 'lb' ? 'bg-karga-orange text-white' : 'text-white/40'}`}
              >
                LB
              </button>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-8">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl font-bold transition-colors"
          >
            <FiLogOut size={20} />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}
