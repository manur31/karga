export default function Avatar({ 
    src, 
    initial, 
    icon: Icon, 
    variant = 'orange', 
    size = 'md',
    className = '' 
  }) {
    
    const sizes = {
      sm: "w-8 h-8 text-xs",
      md: "w-12 h-12 text-base",
      lg: "w-16 h-16 text-xl"
    };
  
    const variants = {
      orange: "bg-karga-orange/20 text-karga-orange",
      red: "bg-red-500/20 text-red-500",
      green: "bg-green-500/20 text-green-500",
      blue: "bg-blue-500/20 text-blue-500",
    };
  
    const baseStyles = "flex items-center justify-center rounded-full font-bold overflow-hidden shrink-0";
  
    return (
      <div className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}>
        {src ? (
          <img src={src} alt="avatar" className="w-full h-full object-cover" />
        ) : Icon ? (
          <Icon size={size === 'sm' ? 16 : 24} />
        ) : (
          <span>{initial}</span>
        )}
      </div>
    );
  }