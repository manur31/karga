export const WalkthroughTooltip = ({ title, description, buttonText, onNext, align = 'center' }) => (
  <div className="w-full bg-[#2A2424] rounded-2xl p-4 border border-karga-orange/20 shadow-2xl flex flex-col gap-3 relative animate-fade-in mt-1 z-50">
    <div className={`absolute -top-2 ${align === 'center' ? 'left-1/2 -translate-x-1/2' : align === 'left' ? 'left-2' : 'right-2'} w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-[#2A2424]`} />
    <div className="flex items-start gap-3">
      <div className="w-6 h-6 rounded-full bg-karga-orange/10 flex items-center justify-center shrink-0 text-karga-orange mt-0.5">
         <span className="font-bold text-xs italic font-serif">i</span>
      </div>
      <div className="flex flex-col gap-1 text-left">
        <h4 className="text-white font-bold text-base tracking-wide">{title}</h4>
        <p className="text-zinc-400 text-xs leading-relaxed font-medium">{description}</p>
      </div>
    </div>
    <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="w-full py-2 px-4 bg-karga-orange hover:bg-orange-600 text-white rounded-xl font-bold text-sm transition-colors mt-1">
      {buttonText}
    </button>
  </div>
);
