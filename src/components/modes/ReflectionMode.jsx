import { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Lightbulb, MessageSquare, List, Copy, Bot, Send, Loader,
  RefreshCw, ArrowRight
} from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { PERSONAS } from '../../constants/personas';
import { REFLECTION_PAPERS } from '../../constants/reflectionPapers';
import { generateGeminiResponse } from '../../utils/api';

const ReflectionMode = ({ 
  chatMessages, setChatMessages,
  chatPersona, setChatPersona,
  articles, 
  nodes,
  searchQuery,
  notes,
  paperDetailsCache = {}
}) => {
  const [activeSidebarTab, setActiveSidebarTab] = useState('insights');
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isRefreshingInsights, setIsRefreshingInsights] = useState(false);
  const [generatedInsights, setGeneratedInsights] = useState([]);
  const chatEndRef = useRef(null);

  const papersToDisplay = articles.length > 0 ? articles.map((article, idx) => {
    const articleNotes = notes[article.id] || {};
    const formattedNotes = [
      articleNotes.patterns && `Patterns: ${articleNotes.patterns}`,
      articleNotes.thesis_impact && `Impact: ${articleNotes.thesis_impact}`,
      articleNotes.gaps && `Gaps: ${articleNotes.gaps}`
    ].filter(Boolean).join('\n\n');

    // Use AI-generated summary from paperDetailsCache if available, otherwise use article summary
    // Prefer AI-generated summary which has complete sentences
    const articleId = article.id || article.title;
    const cachedDetails = paperDetailsCache[articleId];
    let summary = '';
    
    if (cachedDetails && cachedDetails.summary) {
      // Use AI-generated summary (complete sentences, no truncation)
      summary = cachedDetails.summary;
    } else {
      // Fall back to article summary, but clean up any truncation
      summary = article.summary || '';
      // Remove truncation markers and ensure it's a complete sentence
      summary = summary.replace(/\.\.\./g, '').trim();
      // If summary doesn't end with proper punctuation, it might be truncated
      // In that case, we'll still show it but note that AI summary would be better
    }

    return {
      id: article.id || `gen-${idx}`,
      title: article.title,
      author: article.author,
      year: article.year,
      journal: article.journal,
      relevance: 'neutral',
      summary: summary,
      notes: formattedNotes || "No specific notes recorded yet.",
      citation: `${article.author} (${article.year}). ${article.title}. ${article.journal}. ${article.doi_url || ''}`
    };
  }) : REFLECTION_PAPERS;

  const allImpacts = Object.values(notes)
    .map(n => n.thesis_impact)
    .filter(Boolean);
  
  const allGaps = Object.values(notes)
    .map(n => n.gaps)
    .filter(Boolean);

  const insightsToDisplay = generatedInsights.length > 0 
    ? generatedInsights
    : [
        ...allImpacts.map(text => ({ text: `Thesis Impact: ${text}`, type: 'note' })),
        ...allGaps.map(text => ({ text: `Identified Gap: ${text}`, type: 'gap' })),
        ...nodes.filter(n => n.theme === 'thesis' || n.theme === 'insight').map(n => ({ text: n.content, type: 'node' }))
      ];

  useEffect(() => {
    if (chatEndRef.current) {
      // Only scroll within the chat container, not the whole page
      chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, [chatMessages]);

  const handlePersonaChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setIsChatLoading(true);

    const contextArticles = papersToDisplay.map(p => `"${p.title}"`).join(', ');
    const contextNotes = JSON.stringify(notes);

    const prompt = `${chatPersona.prompt} 
    
    RESEARCH CONTEXT:
    Topic: "${searchQuery || 'General Inquiry'}"
    Key Papers Found: ${contextArticles}
    User's Notes: ${contextNotes}
    
    User Input: "${userMsg}"
    
    Respond in character as ${chatPersona.name}. Keep it under 50 words. Be specific to the papers mentioned if possible.`;

    const response = await generateGeminiResponse(prompt);
    const textResponse = typeof response === 'object' ? JSON.stringify(response) : String(response);
    setChatMessages(prev => [...prev, { role: 'ai', text: textResponse }]);
    setIsChatLoading(false);
  };

  const copyCitation = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleRefreshAnalysis = async () => {
    setIsRefreshingInsights(true);
    
    try {
      const contextArticles = papersToDisplay.map(p => `"${p.title}" by ${p.author} (${p.year})`).join(', ');
      const contextNotes = JSON.stringify(notes);
      const nodeThemes = nodes.map(n => `${n.title}: ${n.content}`).join('; ');

      const prompt = `You are a research synthesis assistant. Analyze the following research context and generate 3-5 specific, actionable research insights or "rabbit holes" (interesting directions to explore further).

RESEARCH CONTEXT:
Topic: "${searchQuery || 'General Inquiry'}"
Key Papers: ${contextArticles || 'None yet'}
User's Notes: ${contextNotes || 'None yet'}
Canvas Nodes: ${nodeThemes || 'None yet'}

Generate insights that:
1. Connect patterns across the research
2. Identify gaps or contradictions
3. Suggest new angles or questions to explore
4. Are specific and actionable

Return ONLY a JSON array of objects, each with "text" (the insight) and "type" (one of: "pattern", "gap", "question", "connection"). Example format:
[{"text": "The relationship between X and Y appears inconsistent across studies", "type": "pattern"}, {"text": "No longitudinal studies found on Z", "type": "gap"}]

Do not include any other text, just the JSON array.`;

      const response = await generateGeminiResponse(prompt);
      
      // Try to parse JSON from response
      let cleaned = response.trim();
      cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        cleaned = jsonMatch[0];
      }
      
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setGeneratedInsights(parsed);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Failed to refresh insights:", error);
      // Fall back to default insights
      setGeneratedInsights([]);
    } finally {
      setIsRefreshingInsights(false);
    }
  };

  return (
    <div className="flex h-full gap-6 p-8 overflow-hidden relative">
      <div className="flex-1 flex flex-col min-w-0 z-10">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-[#1A1A2E] mb-2 drop-shadow-sm">Literature Matrix</h2>
          <p className="text-[#1A1A2E]/70 text-sm">
            {articles.length > 0 ? `Analysis of ${articles.length} sources found for "${searchQuery}"` : "A unified view of verified sources, their stance, and synthesis."}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar pb-20">
          {papersToDisplay.map((paper) => {
            const isSupporting = paper.relevance === 'supports';
            const isContradicting = paper.relevance === 'contradicts';
            
            return (
              <GlassCard key={paper.id} className="p-6 relative group border-l-4 transition-all hover:scale-[1.01]" style={{ borderLeftColor: isSupporting ? '#10b981' : isContradicting ? '#ef4444' : '#64748b' }}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg text-[#1A1A2E] leading-tight">{paper.title}</h3>
                    <div className="text-xs text-[#1A1A2E]/60 font-medium mt-1">{paper.author} • {paper.year} • {paper.journal}</div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${isSupporting ? 'bg-emerald-100/50 text-emerald-700 border-emerald-200' : isContradicting ? 'bg-red-100/50 text-red-700 border-red-200' : 'bg-gray-100/50 text-gray-600 border-gray-200'}`}>
                    {paper.relevance}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-white/40 rounded-xl p-3 border border-white/50">
                    <div className="flex items-center gap-2 mb-1 text-xs font-bold text-[#0937B8] uppercase tracking-wider"><Sparkles size={12}/> AI Summary</div>
                    <p className="text-xs text-[#1A1A2E]/80 leading-relaxed">{paper.summary}</p>
                  </div>
                  <div className="bg-yellow-50/40 rounded-xl p-3 border border-yellow-100/50">
                    <div className="flex items-center gap-2 mb-1 text-xs font-bold text-amber-600 uppercase tracking-wider"><MessageSquare size={12}/> My Notes</div>
                    <p className="text-xs text-[#1A1A2E]/80 leading-relaxed italic whitespace-pre-line">{paper.notes}</p>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      <div className="w-[350px] shrink-0 flex flex-col z-20 h-full">
        <div className="flex p-1 bg-white/40 backdrop-blur-md rounded-2xl border border-white/50 mb-4 shadow-sm">
          {[
            { id: 'citations', label: 'Citations', icon: List },
            { id: 'insights', label: 'Insights', icon: Lightbulb },
            { id: 'chat', label: 'Persona Chat', icon: MessageSquare }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSidebarTab(tab.id)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${activeSidebarTab === tab.id ? 'bg-white shadow-md text-[#0937B8]' : 'text-[#1A1A2E]/60 hover:bg-white/20'}`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 bg-white/30 backdrop-blur-xl border border-white/50 rounded-3xl shadow-xl overflow-hidden flex flex-col relative min-h-0">
          {activeSidebarTab === 'citations' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              <div className="text-xs font-bold text-[#1A1A2E]/50 uppercase tracking-wider mb-2">APA Format (Generated)</div>
              {papersToDisplay.map((paper, i) => (
                <div key={i} className="bg-white/60 p-3 rounded-xl border border-white/60 shadow-sm group hover:border-[#0937B8]/30 transition-colors overflow-hidden">
                  <p className="text-[11px] text-[#1A1A2E] leading-relaxed font-serif mb-2 select-all break-words" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{paper.citation}</p>
                  <button onClick={() => copyCitation(paper.citation)} className="w-full py-1.5 rounded-lg bg-[#0937B8]/5 hover:bg-[#0937B8]/10 text-[#0937B8] text-[10px] font-bold flex items-center justify-center gap-1 transition-colors">
                    <Copy size={12}/> Copy to Clipboard
                  </button>
                </div>
              ))}
              <button className="w-full py-3 mt-4 border-2 border-dashed border-[#0937B8]/20 rounded-xl text-[#0937B8] text-xs font-bold hover:bg-[#0937B8]/5 transition-colors">
                Export Bibliography (.bib)
              </button>
            </div>
          )}

          {activeSidebarTab === 'insights' && (
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <div className="bg-gradient-to-br from-[#8A5EFD] to-[#0937B8] p-4 rounded-2xl text-white mb-4 shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-[#FF6FAE]" />
                  <h3 className="font-bold text-sm">Synthesized Insights</h3>
                </div>
                <p className="text-xs text-white/80 leading-relaxed">
                  {insightsToDisplay.length > 0 
                    ? "Based on your canvas and aggregated research notes, here are the key themes and gaps emerging from your inquiry." 
                    : "Based on your neutral and contradictory findings, your thesis might be stronger if you pivot to 'Cognitive Adaptation' rather than just 'Memory Loss'."}
                </p>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-bold text-[#1A1A2E]/50 uppercase tracking-wider">Suggested "Rabbit Holes"</div>
                {insightsToDisplay.length > 0 ? (
                  insightsToDisplay.map((insight, i) => (
                    <div key={i} className="bg-white/60 p-3 rounded-xl border border-white/60 shadow-sm flex flex-col group cursor-pointer hover:bg-white/80">
                      <span className="text-[10px] font-bold text-[#0937B8] uppercase mb-1">{insight.type}</span>
                      <span className="text-xs font-bold text-[#1A1A2E]">{insight.text}</span>
                    </div>
                  ))
                ) : (
                  ['Neuroplasticity & AI', 'Prompt Engineering as a Skill', 'Longitudinal Studies on LLMs'].map((topic, i) => (
                    <div key={i} className="bg-white/60 p-3 rounded-xl border border-white/60 shadow-sm flex justify-between items-center group cursor-pointer hover:bg-white/80">
                      <span className="text-xs font-bold text-[#1A1A2E]">{topic}</span>
                      <ArrowRight size={14} className="text-[#0937B8] opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
                    </div>
                  ))
                )}
              </div>
              
              <div className="mt-6 text-center">
                <button 
                  onClick={handleRefreshAnalysis}
                  disabled={isRefreshingInsights}
                  className="text-[10px] font-bold text-[#1A1A2E]/40 flex items-center justify-center gap-1 mx-auto hover:text-[#0937B8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw size={10} className={isRefreshingInsights ? 'animate-spin' : ''} /> 
                  {isRefreshingInsights ? 'Analyzing...' : 'Refresh Analysis'}
                </button>
              </div>
            </div>
          )}

          {activeSidebarTab === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="p-2 border-b border-white/20 bg-white/20 shrink-0">
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
                  {PERSONAS.map(p => (
                    <button 
                      key={p.id}
                      onClick={() => { setChatPersona(p); setChatMessages([]); }}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-lg border text-[10px] font-bold flex items-center gap-1.5 transition-all ${chatPersona.id === p.id ? 'bg-white shadow-sm border-transparent' : 'bg-transparent border-transparent opacity-60 hover:opacity-100'}`}
                      style={{ color: chatPersona.id === p.id ? p.color : '#1A1A2E' }}
                    >
                      <p.icon size={12} /> {p.name}
                    </button>
                  ))}
                </div>
                <div className="px-1 pt-1 text-[10px] text-[#1A1A2E]/60 text-center italic truncate">
                  Currently chatting with: <span className="font-bold">{chatPersona.role}</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar min-h-0">
                {chatMessages.length === 0 && (
                  <div className="text-center mt-10 opacity-50">
                    <Bot size={24} className="mx-auto mb-2" />
                    <p className="text-xs">Start a debate with {chatPersona.name}...</p>
                  </div>
                )}
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-2.5 rounded-2xl text-xs leading-relaxed ${msg.role === 'user' ? 'bg-[#0937B8] text-white rounded-br-none' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none shadow-sm'}`}>
                      {typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text)}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white p-2 rounded-xl rounded-bl-none shadow-sm"><Loader size={12} className="animate-spin text-gray-400"/></div>
                  </div>
                )}
                <div ref={chatEndRef} style={{ height: '1px' }} />
              </div>

              <div className="p-3 bg-white/40 border-t border-white/50 shrink-0">
                <div className="flex gap-2">
                  <input 
                    className="flex-1 bg-white border-none rounded-xl px-3 py-2 text-xs focus:outline-none shadow-sm placeholder-gray-400"
                    placeholder={`Ask ${chatPersona.name}...`}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePersonaChat()}
                  />
                  <button 
                    onClick={handlePersonaChat}
                    disabled={!chatInput.trim() || isChatLoading}
                    className="p-2 bg-[#1A1A2E] text-white rounded-xl hover:opacity-90 disabled:opacity-50"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReflectionMode;

