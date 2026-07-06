import { createPortal } from 'react-dom';
import { FiX, FiLogOut, FiSettings, FiUser } from 'react-icons/fi';
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

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-[#2A2424] w-full max-w-sm rounded-3xl flex flex-col shadow-2xl border border-white/5 overflow-hidden animate-slide-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-black/20">
          <h2 className="text-white text-lg font-bold">Perfil y Ajustes</h2>
          <button onClick={onClose} className="p-1 text-white/50 hover:text-white transition-colors">
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* User Info */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <FiUser size={28} className="text-white/20" />
            </div>
            <div className="text-center">
              <h3 className="text-white font-bold text-base">{user?.name || "Usuario Karga"}</h3>
              <p className="text-white/40 text-xs">{user?.email || "usuario@ejemplo.com"}</p>
            </div>
          </div>

          {/* Preferences */}
          <div className="flex flex-col gap-2">
            <h4 className="text-white/40 text-[10px] font-bold uppercase tracking-wider pl-1">Preferencias</h4>
            
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2.5">
                <FiSettings className="text-karga-orange" size={18} />
                <span className="text-white text-sm font-medium">Unidad de Peso</span>
              </div>
              <div className="flex bg-black/30 rounded-xl p-0.5 border border-white/5">
                <button 
                  onClick={() => setWeightUnit('kg')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${weightUnit === 'kg' ? 'bg-karga-orange text-white shadow-md' : 'text-white/40'}`}
                >
                  KG
                </button>
                <button 
                  onClick={() => setWeightUnit('lb')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${weightUnit === 'lb' ? 'bg-karga-orange text-white shadow-md' : 'text-white/40'}`}
                >
                  LB
                </button>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="pt-2">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-bold text-sm transition-colors border border-red-500/5"
            >
              <FiLogOut size={16} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
