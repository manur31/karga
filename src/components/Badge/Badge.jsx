export default function Badge({ 
    children, 
    variant = 'orange', 
    className = '', 
    ...props 
  }) {
    
    const variants = {
      orange: "bg-karga-orange/10 text-karga-orange",
      green: "bg-green-500/10 text-green-500",
      red: "bg-red-500/10 text-red-500",
      gray: "bg-zinc-500/10 text-zinc-400"
    };
  
    const baseStyles = "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold";
  
    return (
      <div className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
        {children}
      </div>
    );
  }