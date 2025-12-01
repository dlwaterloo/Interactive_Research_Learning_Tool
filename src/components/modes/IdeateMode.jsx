import { useState } from 'react';
import { Lightbulb, Sparkles, Loader, ArrowRight } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { generateGeminiResponse } from '../../utils/api';

const IdeateMode = ({ setSearchQuery, setActiveTab }) => {
  const [input, setInput] = useState('');
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleBrainstorm = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setIdeas([]);
    const prompt = `Generate 4 distinct, academic research questions based on the broad topic: "${input}". 
    Focus on specific, debatable, and researchable angles suitable for an undergraduate paper.
    Return ONLY a JSON array of strings. Example: ["How does X affect Y?", "The role of Z in W"]`;
    
    try {
      const response = await generateGeminiResponse(prompt);
      const cleaned = response.replace(/```json\n|\n```/g, '');
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) setIdeas(parsed);
    } catch (e) {
      console.error("Ideation failed", e);
      setIdeas(["Error generating topics. Please try again."]);
    }
    setLoading(false);
  };

  const handleSelectIdea = (idea) => {
    setSearchQuery(idea);
    setActiveTab('research');
  };

  return (
    <div className="flex h-full p-8 flex-col items-center justify-center relative overflow-hidden">
      <div className="z-10 max-w-2xl w-full flex flex-col gap-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-[#1e1b4b] mb-4 drop-shadow-sm">Topic Generator</h2>
          <p className="text-[#1e1b4b]/70 text-lg">Enter a broad subject to generate specific research inquiries.</p>
        </div>

        <div className="w-full bg-white/40 backdrop-blur-xl p-2 rounded-2xl shadow-xl border border-white/60 flex items-center gap-2 transform hover:scale-[1.01] transition-all ring-1 ring-white/50">
          <div className="p-3 bg-pink-100/30 rounded-xl text-[#f472b6]">
            <Lightbulb size={24} />
          </div>
          <input 
            type="text" 
            placeholder="e.g., Artificial Intelligence, Climate Change, Mental Health..." 
            className="flex-1 text-lg outline-none bg-transparent placeholder-[#1A1A2E]/40 text-[#1A1A2E] font-medium"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleBrainstorm()}
          />
          <button 
            onClick={handleBrainstorm}
            disabled={loading || !input.trim()}
            className="bg-[#f472b6] text-white px-8 py-3 rounded-xl font-bold hover:bg-pink-500 transition-colors shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader size={20} className="animate-spin" /> : 'Brainstorm'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ideas.map((idea, idx) => (
            <GlassCard 
              key={idx} 
              onClick={() => handleSelectIdea(idea)}
              className="p-6 cursor-pointer hover:bg-white/60 hover:border-pink-300/50 group transition-all animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 rounded-full bg-pink-100/50 text-[#f472b6] group-hover:scale-110 transition-transform">
                  <Sparkles size={16} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[#1A1A2E] text-md leading-tight group-hover:text-[#0937B8] transition-colors">{idea}</h3>
                  <div className="mt-2 text-xs font-bold text-[#0937B8] uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    Start Research <ArrowRight size={12} />
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IdeateMode;

