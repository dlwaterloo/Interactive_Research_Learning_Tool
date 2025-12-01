const Button = ({ children, onClick, variant = 'primary', className = '', icon: Icon, disabled = false }) => {
  const baseStyle = "px-6 py-2.5 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 backdrop-blur-md disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: `bg-gradient-to-r from-[#0937B8] to-[#082a8e] text-white hover:opacity-90 border border-white/20`,
    secondary: `bg-white/30 text-[#0937B8] hover:bg-white/50 border border-white/40`,
    accent: `bg-gradient-to-r from-[#FF6FAE] to-[#e64d8e] text-white hover:opacity-90 border border-white/20`,
    ghost: `bg-transparent text-[#0937B8] hover:bg-white/20 border border-transparent`,
    outline: `border-2 border-[#0937B8]/30 text-[#0937B8] hover:bg-[#0937B8]/5`,
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

export default Button;

