import { useState } from 'react';
import { Lightbulb, BookOpen, PenTool, Layout } from 'lucide-react';
import Header from './components/Header';
import IntroductionScreen from './components/IntroductionScreen';
import IdeateMode from './components/modes/IdeateMode';
import ResearchMode from './components/modes/ResearchMode';
import InteractiveMode from './components/modes/InteractiveMode';
import ReflectionMode from './components/modes/ReflectionMode';
import { LEARNING_MODULES } from './constants/learningModules';
import { PERSONAS } from './constants/personas';

const App = () => {
  const [activeTab, setActiveTab] = useState('research');
  const [showIntro, setShowIntro] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState([]);
  const [activeArticle, setActiveArticle] = useState(null);
  const [modules, setModules] = useState(LEARNING_MODULES);

  const [researchNotes, setResearchNotes] = useState({});
  const [interactiveNodes, setInteractiveNodes] = useState([]);
  const [interactiveConnections, setInteractiveConnections] = useState([]);

  const [reflectionChatMessages, setReflectionChatMessages] = useState([
    { role: 'ai', text: "I've reviewed your literature matrix. The methodology in Smith (2024) seems robust, but have you considered the sample bias?" }
  ]);
  const [reflectionPersona, setReflectionPersona] = useState(PERSONAS[0]);

  const [userName, setUserName] = useState("Alex Researcher");
  const [userRole, setUserRole] = useState("PhD Candidate");

  const handleIntroNavigation = (tab) => {
    setActiveTab(tab);
    setShowIntro(false);
  };

  if (showIntro) {
    return <IntroductionScreen 
      onNavigate={handleIntroNavigation} 
      onStart={() => handleIntroNavigation('research')} 
      userName={userName}
      userRole={userRole}
      setUserName={setUserName}
      setUserRole={setUserRole}
    />;
  }

  return (
    <div className="w-full h-screen flex flex-col font-sans text-[#1A1A2E] overflow-hidden relative">
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Merriweather+Sans:wght@300;400;500;700;800&display=swap');
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 4px; }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .perspective-1000 { perspective: 1000px; }
        `}
      </style>

      <div className={`absolute inset-0 z-0 transition-all duration-700 ${activeTab === 'interactive' ? 'opacity-100' : 'opacity-100'}`}>
        {activeTab === 'interactive' ? (
          <div className="absolute inset-0 bg-gradient-to-br from-[#d946ef] via-[#8b5cf6] to-[#3b82f6]">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#8A5EFD]/30 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[20%] w-[60%] h-[40%] rounded-full bg-[#FF6FAE]/20 blur-[120px]" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#E0C3FC] via-[#F0F4FF] to-[#C2E9FB]">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#8A5EFD]/20 blur-[120px]" />
            <div className="absolute top-[10%] right-[-10%] w-[40%] h-[60%] rounded-full bg-[#0937B8]/20 blur-[140px]" />
            <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] rounded-full bg-[#FF6FAE]/20 blur-[120px]" />
          </div>
        )}
      </div>
      
      <Header 
        showBack={true}
        onBack={() => setShowIntro(true)}
        userName={userName}
        userRole={userRole}
        setUserName={setUserName}
        setUserRole={setUserRole}
      />

      <div className="h-14 flex items-center justify-center gap-4 z-20 shrink-0 relative">
        <div className="bg-white/30 backdrop-blur-xl p-1 rounded-2xl border border-white/50 shadow-sm flex gap-1 mt-2 ring-1 ring-white/40">
          {[
            { id: 'ideate', label: 'Ideate Mode', icon: Lightbulb },
            { id: 'research', label: 'Research Mode', icon: BookOpen },
            { id: 'interactive', label: 'Interactive Mode', icon: PenTool },
            { id: 'reflection', label: 'Reflection Mode', icon: Layout },
          ].map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={`px-5 py-2 text-xs font-bold flex items-center gap-2 rounded-xl transition-all duration-300 ${activeTab === tab.id ? 'bg-gradient-to-r from-[#0937B8] to-[#082a8e] text-white shadow-lg shadow-blue-900/20' : 'text-[#1A1A2E]/60 hover:bg-white/40 hover:text-[#0937B8]'}`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 overflow-hidden relative z-10">
        {activeTab === 'ideate' && (
          <IdeateMode 
            setSearchQuery={setSearchQuery} 
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === 'research' && (
          <ResearchMode 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            articles={articles}
            setArticles={setArticles}
            activeArticle={activeArticle}
            setActiveArticle={setActiveArticle}
            modules={modules}
            setModules={setModules}
            notes={researchNotes}
            setNotes={setResearchNotes}
          />
        )}
        {activeTab === 'interactive' && (
          <InteractiveMode 
            searchQuery={searchQuery}
            activeArticle={activeArticle}
            nodes={interactiveNodes}
            setNodes={setInteractiveNodes}
            connections={interactiveConnections}
            setConnections={setInteractiveConnections}
          />
        )}
        {activeTab === 'reflection' && (
          <ReflectionMode 
            chatMessages={reflectionChatMessages}
            setChatMessages={setReflectionChatMessages}
            chatPersona={reflectionPersona}
            setChatPersona={setReflectionPersona}
            articles={articles}
            nodes={interactiveNodes}
            searchQuery={searchQuery}
            notes={researchNotes}
          />
        )}
      </main>
    </div>
  );
};

export default App;

