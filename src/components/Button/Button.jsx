export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = '',
  ...props
}) {
  const baseStyles = "flex items-center justify-center transition-all duration-200 font-bold gap-1 border border-white/5 shadow-inner outline-none focus-visible:ring-2 focus-visible:ring-karga-orange/50 cursor-pointer";
  
  const variants = {
    primary: "bg-karga-orange text-white shadow-lg shadow-black/20 hover:brightness-110 active:scale-[0.98]",
    secondary: "bg-karga-gray text-white hover:brightness-90 active:scale-[0.98]", 
    ghost: "bg-transparent text-zinc-400 hover:text-white active:scale-[0.95]",
  };

  const sizes = {
    sm: "px-2 py-1 text-[10px] rounded-lg",      
    md: "px-6 py-4 text-base rounded-2xl",    
    lg: "w-full py-5 text-lg rounded-2xl",   
  };

  return (
    <button
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}