import { ArrowLeft, Brain, Sparkles, User, RotateCcw } from 'lucide-react';
import ProfileImage from './ui/ProfileImage';

const Header = ({ showBack = false, onBack, onRestart, userName, userRole, setUserName, setUserRole }) => (
  <header className="mx-6 mt-6 mb-2 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#1e40af] text-white flex items-center justify-between px-8 py-3 z-30 shrink-0 relative shadow-xl hover:shadow-2xl transition-all duration-300 ring-1 ring-white/20">
    <div className="flex items-center gap-3">
      {showBack && (
        <button 
          onClick={onBack}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-xl mr-2 transition-all group"
          title="Back to Home"
        >
          <ArrowLeft size={20} className="text-white group-hover:-translate-x-1 transition-transform"/>
        </button>
      )}
      <div className="relative flex items-center justify-center">
        <Brain size={32} className="text-white drop-shadow-md" strokeWidth={2.5} />
        <Sparkles size={14} className="absolute -top-1 -right-2 text-[#FF6FAE] animate-pulse" fill="#FF6FAE"/>
      </div>
      <h1 className="text-2xl font-black tracking-tighter drop-shadow-lg">QUIREY</h1>
    </div>
    <div className="flex items-center gap-4">
      {onRestart && (
        <button 
          onClick={onRestart}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all group"
          title="Restart - Go back to title screen"
        >
          <RotateCcw size={18} className="text-white group-hover:rotate-180 transition-transform duration-500"/>
        </button>
      )}
      <div className="flex flex-col items-end">
        <input 
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="text-sm font-bold text-white tracking-wide bg-transparent border-b border-transparent hover:border-white/40 focus:border-white focus:outline-none rounded-none px-1 text-right w-32 placeholder-white/50 transition-colors"
          placeholder="Your Name"
          title="Edit Name"
        />
        <input
          value={userRole}
          onChange={(e) => setUserRole(e.target.value)}
          className="text-xs text-white/70 font-medium bg-transparent border-b border-transparent hover:border-white/40 focus:border-white focus:outline-none rounded-none px-1 text-right w-32 placeholder-white/40 transition-colors"
          placeholder="Your Role"
          title="Edit Role"
        />
      </div>
      <ProfileImage size={42} />
    </div>
  </header>
);

export default Header;

