const Input = ({ className = '', ...props }) => {
    const baseStyles = "w-full rounded-2xl p-4 bg-input-bg text-white placeholder-zinc-500 font-medium transition-all outline-none border border-white/5";
    const focusStyles = "focus:border-karga-orange focus:ring-4 focus:ring-karga-orange/20";
  
    return (
      <input 
        className={`${baseStyles} ${focusStyles} ${className}`} 
        {...props} 
      />
    );
  };
  
  export default Input;