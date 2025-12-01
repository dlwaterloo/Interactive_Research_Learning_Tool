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
    const prompt = `Generate exactly 4 distinct, academic research questions based on the broad topic: "${input}". 
    Focus on specific, debatable, and researchable angles suitable for an undergraduate paper.
    Return ONLY a valid JSON array of exactly 4 strings, no other text. Format: ["Question 1", "Question 2", "Question 3", "Question 4"]`;
    
    try {
      const response = await generateGeminiResponse(prompt);
      console.log("Gemini raw response:", response);
      
      // Try to extract JSON from the response
      let cleaned = response.trim();
      
      // Remove markdown code blocks if present
      cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Try to find JSON array in the response
      const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        cleaned = jsonMatch[0];
      }
      
      // Try to parse as JSON
      let parsed;
      try {
        parsed = JSON.parse(cleaned);
      } catch (parseError) {
        // If parsing fails, try to extract strings manually
        console.warn("JSON parse failed, trying to extract strings:", parseError);
        const stringMatches = cleaned.match(/"([^"]+)"/g);
        if (stringMatches && stringMatches.length > 0) {
          parsed = stringMatches.map(match => match.replace(/"/g, '')).slice(0, 4);
        } else {
          // Last resort: split by lines and take first 4 non-empty lines
          const lines = cleaned.split('\n').filter(line => line.trim().length > 10).slice(0, 4);
          if (lines.length > 0) {
            parsed = lines;
          } else {
            throw new Error("Could not parse response as JSON or extract strings");
          }
        }
      }
      
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure we have exactly 4 items, pad if needed
        const topics = parsed.slice(0, 4);
        while (topics.length < 4) {
          topics.push(`Research question ${topics.length + 1} about ${input}`);
        }
        setIdeas(topics);
      } else {
        throw new Error("Response is not a valid array");
      }
    } catch (e) {
      console.error("Ideation failed", e);
      // Show more helpful error message
      const errorMsg = e.message || "Unknown error";
      setIdeas([
        `Error: ${errorMsg}`,
        "Please check your API key and try again.",
        "Make sure VITE_GEMINI_API_KEY is set in your .env file.",
        "If the problem persists, check the browser console for details."
      ].slice(0, 4)); // Ensure we only show 4 items
    }
    setLoading(false);
  };

  const handleSelectIdea = (idea) => {
    setSearchQuery(idea);
    setActiveTab('research');
  };

  return (
    <div className="flex h-full p-8 flex-col items-center justify-start relative overflow-y-auto custom-scrollbar">
      {/* Background is now handled by App.jsx for full screen coverage */}
      <div className="z-10 max-w-6xl w-full flex flex-col gap-8 py-4">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">Topic Generator</h2>
          <p className="text-white/80 text-lg">Enter a broad subject to generate specific research inquiries.</p>
        </div>

        <div className="w-full bg-white/20 backdrop-blur-xl p-2 rounded-2xl shadow-xl border border-white/40 flex items-center gap-2 transform hover:scale-[1.01] transition-all ring-1 ring-white/30 mb-8">
          <div className="p-3 bg-white/20 rounded-xl text-white">
            <Lightbulb size={24} />
          </div>
          <input 
            type="text" 
            placeholder="e.g., Artificial Intelligence, Climate Change, Mental Health..." 
            className="flex-1 text-lg outline-none bg-transparent placeholder-white/50 text-white font-medium"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleBrainstorm()}
          />
          <button 
            onClick={handleBrainstorm}
            disabled={loading || !input.trim()}
            className="bg-white text-[#0937B8] px-8 py-3 rounded-xl font-bold hover:bg-white/90 transition-colors shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader size={20} className="animate-spin" /> : 'Brainstorm'}
          </button>
        </div>

        {/* 4 Topic Cards at Top - Similar to Intro Screen Design */}
        {ideas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {ideas.slice(0, 4).map((idea, idx) => (
              <GlassCard 
                key={idx} 
                onClick={() => handleSelectIdea(idea)}
                className="p-6 cursor-pointer hover:bg-white/30 hover:border-white/60 group transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-4 bg-white/10 backdrop-blur-xl border-white/30"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-white/20 text-white group-hover:scale-110 transition-transform">
                      <Sparkles size={20} />
                    </div>
                    <div className="text-xs font-bold text-white/80 uppercase tracking-wider">
                      Topic {idx + 1}
                    </div>
                  </div>
                  <h3 className="font-bold text-white text-lg leading-tight mb-4 group-hover:text-white transition-colors flex-1 drop-shadow-sm">
                    {idea}
                  </h3>
                  <div className="mt-auto pt-4 border-t border-white/30">
                    <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                      Start Research <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {/* Show message when no ideas yet */}
        {ideas.length === 0 && !loading && (
          <div className="text-center text-white/60 italic">
            <p className="text-lg">Enter a topic above and click "Brainstorm" to generate research questions.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IdeateMode;

