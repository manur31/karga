export default function Card({ children, variant = 'default', className = '', ...props }) {
    const variants = {
      default: "bg-karga-gray border-white/5",
      active: "bg-karga-orange border-transparent shadow-lg shadow-karga-orange/20",
      ghost: "bg-transparent border-transparent"
    };
  
    return (
      <div 
        className={`rounded-3xl p-6 transition-all ${variants[variant]} ${className}`} 
        {...props}
      >
        {children}
      </div>
    );
  }