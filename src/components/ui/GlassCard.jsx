const GlassCard = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white/40 backdrop-blur-xl border border-white/60 shadow-lg rounded-2xl transition-all duration-300 ${onClick ? 'cursor-pointer hover:bg-white/60 hover:shadow-xl hover:scale-[1.01] hover:border-white/80' : ''} ${className}`}
  >
    {children}
  </div>
);

export default GlassCard;

