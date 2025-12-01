import { Lightbulb, Compass, GitBranch, FileText, ArrowRight, Maximize2, MoreHorizontal, Sparkles } from 'lucide-react';
import Header from './Header';

const IntroductionScreen = ({ onStart, onNavigate, userName, userRole, setUserName, setUserRole }) => {
  return (
    <div className="w-full h-screen flex flex-col font-sans text-white overflow-hidden relative bg-[#0937B8]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#d946ef] via-[#8b5cf6] to-[#3b82f6]">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#8A5EFD]/30 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[20%] w-[60%] h-[40%] rounded-full bg-[#FF6FAE]/20 blur-[120px]" />
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none" 
          style={{ 
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.25) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            transform: 'perspective(500px) rotateX(20deg) scale(1.5)',
            transformOrigin: 'top center',
          }}>
        </div>
      </div>
      
      <div className="relative z-10 w-full">
        <Header 
          showBack={false}
          userName={userName}
          userRole={userRole}
          setUserName={setUserName}
          setUserRole={setUserRole}
        />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-12">
          <h1 className="text-7xl font-black text-white mb-6 tracking-tight drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">Start your inquiry.</h1>
          <p className="text-2xl text-white/60 font-medium">Learning begins with curiosity.</p>
        </div>

        <button 
          onClick={onStart}
          className="group relative bg-white text-[#1e1b4b] px-10 py-5 rounded-2xl font-black text-lg shadow-[0_0_40px_rgba(139,92,246,0.5)] hover:shadow-[0_0_60px_rgba(139,92,246,0.7)] hover:scale-105 transition-all duration-300 overflow-hidden ring-4 ring-white/20"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
          <span className="relative flex items-center gap-3">Start New Project <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform"/></span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-20 max-w-6xl w-full">
          {[
            { icon: Lightbulb, title: 'Ideate', desc: 'Generate topics and structure your initial inquiry.', color: '#f472b6', action: 'ideate' },
            { icon: Compass, title: 'Explore', desc: 'Find trusted sources and read without distraction.', color: '#60a5fa', action: 'research' },
            { icon: GitBranch, title: 'Visualize', desc: 'Connect ideas on an infinite canvas.', color: '#a78bfa', action: 'interactive' },
            { icon: FileText, title: 'Synthesize', desc: 'Build your arguments with evidence.', color: '#fbbf24', action: 'reflection' }
          ].map((feature, i) => (
            <div 
              key={i} 
              onClick={() => onNavigate(feature.action)}
              className="group p-6 rounded-3xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl cursor-pointer hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-3 text-white">
                <feature.icon size={24} className="transition-colors group-hover:text-[var(--color)] drop-shadow-md" style={{ '--color': feature.color }} />
                <h3 className="font-bold text-lg">{feature.title}</h3>
              </div>
              <p className="text-sm text-white/60 leading-relaxed group-hover:text-white/80 transition-colors">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="absolute bottom-8 right-8 z-20">
        <div className="w-12 h-32 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex flex-col items-center justify-between p-2 shadow-2xl text-white/60">
          <div className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center cursor-pointer transition-colors"><MoreHorizontal size={16}/></div>
          <div className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center cursor-pointer transition-colors"><Sparkles size={16}/></div>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white cursor-pointer shadow-lg border border-white/10"><Maximize2 size={16}/></div>
        </div>
      </div>
    </div>
  );
};

export default IntroductionScreen;

