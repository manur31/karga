import { usePrototypeStore } from '../stores/prototypeStore';

export default function DevToggle() {
  const { version, setVersion } = usePrototypeStore();

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-[9999]">
      <div className="bg-black/80 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-2xl flex flex-col items-center gap-2">
        {[4, 3, 2, 1].map((internalV, index) => {
          const displayV = index + 1;
          return (
            <button
              key={internalV}
              onClick={() => setVersion(internalV)}
              className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center transition-all ${
                version === internalV 
                  ? 'bg-karga-orange text-white shadow-lg shadow-karga-orange/30' 
                  : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              V{displayV}
            </button>
          );
        })}
      </div>
    </div>
  );
}
