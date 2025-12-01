import { useState, useEffect } from 'react';
import { 
  Search, Link as LinkIcon, ArrowLeft, PanelRightClose, PanelRightOpen,
  Quote, HelpCircle, Loader,
  BrainCircuit, Layout, Scale, User, Calendar, BookOpen, Award, Sparkles
} from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import SwipeableCard from '../ui/SwipeableCard';
import LearningModulesSidebar from '../LearningModulesSidebar';
import { generateGeminiResponse, searchGoogleScholar } from '../../utils/api';
import { COLORS } from '../../constants/colors';

const ResearchMode = ({ 
  searchQuery, setSearchQuery, 
  articles, setArticles, 
  activeArticle, setActiveArticle,
  modules, setModules,
  notes, setNotes
}) => {
  const [viewState, setViewState] = useState('search');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [paperDetails, setPaperDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  useEffect(() => {
    if (activeArticle) {
      setViewState('reading');
      fetchPaperDetails(activeArticle);
      setCurrentCardIndex(0);
    } else {
      setViewState('search');
      setPaperDetails(null);
      setCurrentCardIndex(0);
    }
  }, [activeArticle]);

  const fetchPaperDetails = async (article) => {
    if (!article || article.id === 'default-1') return;
    
    setIsLoadingDetails(true);
    setPaperDetails(null);

    try {
      const prompt = `Analyze this research paper and provide a comprehensive summary in JSON format:

Title: "${article.title}"
Author(s): "${article.author}"
Journal: "${article.journal}"
Year: "${article.year}"
Abstract/Snippet: "${article.abstract || article.summary}"

Please provide a JSON object with the following structure:
{
  "summary": "A 2-3 paragraph comprehensive summary of the paper",
  "keyFindings": ["Finding 1", "Finding 2", "Finding 3"],
  "methodology": "Brief description of the research methodology",
  "contributions": "What this paper contributes to the field",
  "authorInfo": "Brief information about the author(s) and their expertise",
  "relevance": "Why this paper is relevant and important",
  "limitations": "Any limitations mentioned or apparent",
  "futureWork": "Future research directions suggested"
}

Return ONLY valid JSON, no markdown formatting.`;

      const response = await generateGeminiResponse(prompt);
      let details;
      
      try {
        const cleaned = response.replace(/```json\n|\n```/g, '').trim();
        details = JSON.parse(cleaned);
      } catch (e) {
        // Fallback if JSON parsing fails
        details = {
          summary: response || article.abstract || article.summary,
          keyFindings: [],
          methodology: "Not specified",
          contributions: "See summary",
          authorInfo: article.author,
          relevance: "See summary",
          limitations: "Not specified",
          futureWork: "Not specified"
        };
      }

      setPaperDetails(details);
    } catch (error) {
      console.error("Failed to fetch paper details:", error);
      // Fallback to basic info
      setPaperDetails({
        summary: article.abstract || article.summary || "No summary available.",
        keyFindings: [],
        methodology: "Not specified",
        contributions: "See summary",
        authorInfo: article.author,
        relevance: "See summary",
        limitations: "Not specified",
        futureWork: "Not specified"
      });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  useEffect(() => {
    if (searchQuery && articles.length === 0 && !isSearching) {
      handleSearch();
    }
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setArticles([]); 
    setActiveArticle(null);
    setSearchError(null);

    try {
      console.log("Starting search for:", searchQuery);
      const serpData = await searchGoogleScholar(searchQuery);
      console.log("SerpAPI response received:", serpData);
      
      const organicResults = serpData.organic_results || [];
      
      if (organicResults.length === 0) {
        setSearchError("No results found. Try a different search query.");
        return;
      }
      
      // Transform SerpAPI results to our article format
      const transformedArticles = organicResults.slice(0, 10).map((result, index) => {
        // Extract year from publication_info if available
        const pubInfo = result.publication_info?.summary || '';
        const yearMatch = pubInfo.match(/\b(19|20)\d{2}\b/);
        const year = yearMatch ? yearMatch[0] : 'N/A';
        
        // Extract author from publication_info
        const authorMatch = pubInfo.match(/^([^-]+)/);
        const author = authorMatch ? authorMatch[0].trim() : 'Unknown Author';
        
        // Extract journal from publication_info
        const journalMatch = pubInfo.match(/- (.+?)(?:, \d{4}|$)/);
        const journal = journalMatch ? journalMatch[1].trim() : pubInfo.split('-')[1]?.trim() || 'Unknown Journal';
        
        // Determine type based on title/content
        const titleLower = result.title?.toLowerCase() || '';
        const type = titleLower.includes('review') || titleLower.includes('systematic') 
          ? 'SYSTEMATIC REVIEW' 
          : 'JOURNAL ARTICLE';
        
        return {
          id: result.result_id || `serp-${index}`,
          type: type,
          title: result.title || 'Untitled',
          author: author,
          year: year,
          journal: journal,
          summary: result.snippet || 'No summary available.',
          abstract: result.snippet || 'No abstract available.',
          introduction: result.snippet || 'No introduction available.',
          results: '',
          doi_url: result.link || '',
          source_url: result.link || '',
          cited_by: result.inline_links?.cited_by?.total || 0,
          citation_count: result.inline_links?.cited_by?.total || 0
        };
      });
      
      if (transformedArticles.length > 0) {
        setArticles(transformedArticles);
        console.log("Successfully transformed", transformedArticles.length, "articles");
      } else {
        setSearchError("No articles could be processed from the search results.");
      }
    } catch (error) {
      console.error("Search failed:", error);
      setSearchError(error.message || "Failed to search papers. Please check your API key and try again.");
      setArticles([]);
    } finally {
      setIsSearching(false);
    }
  };

  const getArticleStyles = (type) => {
    if (type === 'JOURNAL ARTICLE') {
      return {
        badgeBg: 'bg-blue-100/40',
        badgeBorder: 'border-blue-200/50',
        badgeText: 'text-blue-600',
        hoverGradient: 'from-blue-100/20 to-purple-100/20',
      };
    } else {
      return {
        badgeBg: 'bg-purple-100/40',
        badgeBorder: 'border-purple-200/50',
        badgeText: 'text-purple-600',
        hoverGradient: 'from-purple-100/20 to-blue-100/20',
      };
    }
  };

  const defaultArticle = {
    id: 'default-1',
    title: "No article selected",
    author: "N/A",
    journal: "N/A",
    year: "N/A",
    type: "JOURNAL ARTICLE",
    abstract: "Please select an article from the search results to view its details.",
    summary: "No article selected.",
    source_url: "",
    doi_url: ""
  };

  const currentArticle = activeArticle || defaultArticle;
  const currentArticleNotes = notes[currentArticle.id] || { patterns: '', thesis_impact: '', gaps: '' };

  const handleNoteChange = (field, value) => {
    setNotes(prev => ({
      ...prev,
      [currentArticle.id]: {
        ...(prev[currentArticle.id] || { patterns: '', thesis_impact: '', gaps: '' }),
        [field]: value
      }
    }));
  };

  if (viewState === 'search') {
    return (
      <div className="flex h-full gap-6 p-8 overflow-hidden relative">
        <div className="flex-1 flex flex-col items-center max-w-4xl mx-auto z-10">
          <div className="w-full text-center mb-10">
            <h2 className="text-4xl font-bold text-[#1e1b4b] mb-4 drop-shadow-md">Start your discovery</h2>
            <p className="text-[#1e1b4b]/80 text-lg font-medium">Search across verified journals, white papers, and systematic reviews.</p>
          </div>
          
          <div className="w-full bg-white/40 backdrop-blur-xl p-2 rounded-2xl shadow-xl border border-white/60 flex items-center gap-2 mb-8 transform hover:scale-[1.01] transition-all ring-1 ring-white/50">
            <div className="p-3 bg-blue-100/30 rounded-xl text-[#0937B8]">
              <Search size={24} />
            </div>
            <input 
              type="text" 
              placeholder="Search for keywords, authors, or DOIs..." 
              className="flex-1 text-lg outline-none bg-transparent placeholder-[#1A1A2E]/40 text-[#1A1A2E] font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="bg-[#0937B8] text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors shadow-lg shadow-blue-900/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? <Loader size={20} className="animate-spin" /> : 'Search'}
            </button>
          </div>

          <div className="w-full flex-1 overflow-y-auto custom-scrollbar pr-2">
            {isSearching ? (
              <div className="flex flex-col items-center justify-center h-64 text-[#1A1A2E]/60">
                <Loader size={40} className="animate-spin mb-4 text-[#0937B8]"/>
                <p className="text-lg font-medium">Searching databases...</p>
              </div>
            ) : articles.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 pb-8">
                {articles.map((article) => {
                  const styles = getArticleStyles(article.type);
                  return (
                    <GlassCard 
                      key={article.id} 
                      onClick={() => { setActiveArticle(article); setViewState('reading'); }} 
                      className="p-6 relative group overflow-hidden cursor-pointer transition-all hover:scale-[1.01]"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${styles.hoverGradient} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-3">
                          <span className={`text-xs font-bold ${styles.badgeText} ${styles.badgeBg} border ${styles.badgeBorder} px-2 py-1 rounded-lg backdrop-blur-sm`}>{article.type}</span>
                          <LinkIcon className="opacity-0 group-hover:opacity-100 text-[#0937B8] transition-opacity" size={20}/>
                        </div>
                        <h3 className="font-bold text-xl text-[#1A1A2E] mb-1 group-hover:text-[#0937B8] transition-colors line-clamp-2">{article.title}</h3>
                        <p className="text-sm text-[#1A1A2E]/60 mb-3 font-medium">{article.author} • {article.year} • {article.journal}</p>
                        <div className="text-sm text-[#1A1A2E]/70 line-clamp-2 leading-relaxed mb-2">{article.summary}</div>
                        {article.citation_count > 0 && (
                          <div className="text-xs text-[#1A1A2E]/50 mb-2">
                            Cited by {article.citation_count} papers
                          </div>
                        )}
                        {(article.source_url || article.doi_url) && (
                          <div className="mt-3 flex items-center gap-1 text-[10px] text-[#0937B8] font-bold uppercase tracking-wider opacity-60">
                            <LinkIcon size={10} /> Real Source Available
                          </div>
                        )}
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            ) : searchError ? (
              <div className="flex flex-col items-center justify-center h-64 text-[#1A1A2E]/60">
                <HelpCircle size={40} className="mb-4 text-red-500"/>
                <p className="text-lg font-medium text-red-600 mb-2">Search Error</p>
                <p className="text-sm text-center max-w-md">{searchError}</p>
                <p className="text-xs text-[#1A1A2E]/40 mt-2">Check the browser console for more details.</p>
              </div>
            ) : searchQuery.trim() && !isSearching && articles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-[#1A1A2E]/60">
                <HelpCircle size={40} className="mb-4 text-[#1A1A2E]/40"/>
                <p className="text-lg font-medium">No results found for "{searchQuery}"</p>
                <p className="text-sm">Try broadening your search terms.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-[#1A1A2E]/50 italic">
                <p className="text-lg font-medium">Enter a query to begin searching.</p>
              </div>
            )}
          </div>
        </div>
        
        <LearningModulesSidebar className="w-[380px]" modules={modules} setModules={setModules} />
      </div>
    );
  }

  return (
    <div className="flex h-full gap-4 p-4 overflow-hidden relative">
      <div className="flex-1 flex flex-col gap-2 min-w-0 z-10">
        <div className="flex items-center justify-between bg-white/20 backdrop-blur-md p-2 rounded-xl border border-white/30">
          <button onClick={() => { setViewState('search'); setActiveArticle(null); }} className="flex items-center gap-2 text-[#1A1A2E] hover:text-[#0937B8] font-bold px-3 py-1.5 rounded-lg transition-all group hover:bg-white/40">
            <ArrowLeft size={18} className="text-[#0937B8]"/>
            <span className="text-sm">Back to Search</span>
          </button>
          
          <div className="flex items-center gap-2 pr-2">
            <span className="text-xs font-bold text-[#1A1A2E]/60 uppercase tracking-wider">Reading Mode</span>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 rounded-lg transition-colors ${!isSidebarOpen ? 'bg-[#0937B8] text-white shadow-md' : 'hover:bg-white/40 text-[#1A1A2E]'}`}
              title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              {isSidebarOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden p-8 relative" style={{ minHeight: '600px' }}>
          {isLoadingDetails ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader size={40} className="animate-spin text-[#0937B8] mb-4"/>
              <p className="text-[#1A1A2E]/70">Analyzing paper and generating summary...</p>
            </div>
          ) : paperDetails ? (
            <div className="relative w-full h-full max-w-2xl mx-auto" style={{ perspective: '1000px', height: '100%', minHeight: '600px' }}>
              {/* Create cards array */}
              {(() => {
                const cards = [];
                
                // Card 0: Title & Metadata
                cards.push({
                  id: 'title',
                  title: 'Paper Overview',
                  content: (
                    <div className="h-full flex flex-col justify-center">
                      <h1 className="text-4xl font-bold text-[#1A1A2E] leading-tight mb-6">{currentArticle.title}</h1>
                      <div className="space-y-4 text-[#1A1A2E]/70">
                        <div className="flex items-center gap-3">
                          <User size={20} className="text-[#0937B8]" />
                          <span className="font-semibold">{currentArticle.author}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <BookOpen size={20} className="text-[#0937B8]" />
                          <span>{currentArticle.journal}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar size={20} className="text-[#0937B8]" />
                          <span>{currentArticle.year}</span>
                        </div>
                        {currentArticle.citation_count > 0 && (
                          <div className="flex items-center gap-3">
                            <Award size={20} className="text-[#0937B8]" />
                            <span>Cited by {currentArticle.citation_count} papers</span>
                          </div>
                        )}
                        <div className="mt-4">
                          <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-bold uppercase">
                            {currentArticle.type}
                          </span>
                        </div>
                        <div className="mt-6 flex gap-3">
                          <Button variant="secondary" icon={Quote} className="text-xs py-2 h-8">Cite This</Button>
                          {(currentArticle.source_url || currentArticle.doi_url) && (
                            <a 
                              href={currentArticle.source_url || currentArticle.doi_url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="px-4 py-2 bg-[#0937B8] text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-bold flex items-center gap-2"
                            >
                              <LinkIcon size={16} />
                              View Source
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                });

                // Card 1: Summary
                if (paperDetails.summary) {
                  cards.push({
                    id: 'summary',
                    title: 'AI-Generated Summary',
                    content: (
                      <div className="h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-6">
                          <Sparkles size={24} className="text-[#8A5EFD]" />
                          <h2 className="text-2xl font-bold text-[#1A1A2E]">Summary</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                          <p className="text-[#1A1A2E]/80 leading-relaxed text-lg whitespace-pre-line">{paperDetails.summary}</p>
                        </div>
                      </div>
                    )
                  });
                }

                // Card 2: Key Findings
                if (paperDetails.keyFindings && paperDetails.keyFindings.length > 0) {
                  cards.push({
                    id: 'findings',
                    title: 'Key Findings',
                    content: (
                      <div className="h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-6">
                          <Award size={24} className="text-[#FACC15]" />
                          <h2 className="text-2xl font-bold text-[#1A1A2E]">Key Findings</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                          <ul className="space-y-4">
                            {paperDetails.keyFindings.map((finding, idx) => (
                              <li key={idx} className="text-[#1A1A2E]/80 text-lg leading-relaxed flex items-start gap-3">
                                <span className="text-[#FACC15] font-bold text-xl mt-1">•</span>
                                <span>{finding}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )
                  });
                }

                // Card 3: Methodology
                if (paperDetails.methodology && paperDetails.methodology !== "Not specified") {
                  cards.push({
                    id: 'methodology',
                    title: 'Methodology',
                    content: (
                      <div className="h-full flex flex-col">
                        <h2 className="text-2xl font-bold text-[#1A1A2E] mb-6">Research Methodology</h2>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                          <p className="text-[#1A1A2E]/80 leading-relaxed text-lg">{paperDetails.methodology}</p>
                        </div>
                      </div>
                    )
                  });
                }

                // Card 4: Contributions
                if (paperDetails.contributions && paperDetails.contributions !== "See summary") {
                  cards.push({
                    id: 'contributions',
                    title: 'Contributions',
                    content: (
                      <div className="h-full flex flex-col">
                        <h2 className="text-2xl font-bold text-[#1A1A2E] mb-6">Key Contributions</h2>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                          <p className="text-[#1A1A2E]/80 leading-relaxed text-lg">{paperDetails.contributions}</p>
                        </div>
                      </div>
                    )
                  });
                }

                // Card 5: Author Info
                if (paperDetails.authorInfo) {
                  cards.push({
                    id: 'authors',
                    title: 'About Authors',
                    content: (
                      <div className="h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-6">
                          <User size={24} className="text-[#8A5EFD]" />
                          <h2 className="text-2xl font-bold text-[#1A1A2E]">About the Authors</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                          <p className="text-[#1A1A2E]/80 leading-relaxed text-lg">{paperDetails.authorInfo}</p>
                        </div>
                      </div>
                    )
                  });
                }

                // Card 6: Relevance
                if (paperDetails.relevance && paperDetails.relevance !== "See summary") {
                  cards.push({
                    id: 'relevance',
                    title: 'Relevance',
                    content: (
                      <div className="h-full flex flex-col">
                        <h2 className="text-2xl font-bold text-[#1A1A2E] mb-6">Relevance & Importance</h2>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                          <p className="text-[#1A1A2E]/80 leading-relaxed text-lg">{paperDetails.relevance}</p>
                        </div>
                      </div>
                    )
                  });
                }

                // Card 7: Limitations
                if (paperDetails.limitations && paperDetails.limitations !== "Not specified") {
                  cards.push({
                    id: 'limitations',
                    title: 'Limitations',
                    content: (
                      <div className="h-full flex flex-col bg-yellow-50">
                        <h2 className="text-2xl font-bold text-[#1A1A2E] mb-6">Limitations</h2>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                          <p className="text-[#1A1A2E]/80 leading-relaxed text-lg">{paperDetails.limitations}</p>
                        </div>
                      </div>
                    )
                  });
                }

                // Card 8: Future Work
                if (paperDetails.futureWork && paperDetails.futureWork !== "Not specified") {
                  cards.push({
                    id: 'future',
                    title: 'Future Work',
                    content: (
                      <div className="h-full flex flex-col">
                        <h2 className="text-2xl font-bold text-[#1A1A2E] mb-6">Future Research Directions</h2>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                          <p className="text-[#1A1A2E]/80 leading-relaxed text-lg">{paperDetails.futureWork}</p>
                        </div>
                      </div>
                    )
                  });
                }

                // Card 9: Source Link (Final card)
                cards.push({
                  id: 'source',
                  title: 'Source',
                  content: (
                    <div className="h-full flex flex-col items-center justify-center">
                      <h2 className="text-2xl font-bold text-[#1A1A2E] mb-6">Read Full Paper</h2>
                      <p className="text-[#1A1A2E]/60 mb-8 text-center">Access the complete paper at the source</p>
                      {(currentArticle.source_url || currentArticle.doi_url) && (
                        <a 
                          href={currentArticle.source_url || currentArticle.doi_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="px-8 py-4 bg-[#0937B8] text-white rounded-xl hover:bg-blue-700 transition-colors text-lg font-bold flex items-center gap-3 shadow-lg"
                        >
                          <LinkIcon size={20} />
                          Open Source
                        </a>
                      )}
                    </div>
                  )
                });

                return cards
                  .map((card, idx) => {
                    const offset = idx - currentCardIndex;
                    
                    // Only render cards that are visible (current + next 2)
                    if (Math.abs(offset) > 2) return null;
                    
                    return (
                      <SwipeableCard
                        key={`${card.id}-${idx}`}
                        index={idx}
                        total={cards.length}
                        title={card.title}
                        onSwipeLeft={() => {
                          if (currentCardIndex < cards.length - 1) {
                            setCurrentCardIndex(prev => prev + 1);
                          }
                        }}
                        onSwipeRight={() => {
                          if (currentCardIndex > 0) {
                            setCurrentCardIndex(prev => prev - 1);
                          }
                        }}
                        onSwipeUp={() => {
                          // Save/bookmark functionality could go here
                          console.log('Saved card:', card.id);
                        }}
                        style={{
                          transform: `translateX(${offset * 20}px) translateY(${Math.abs(offset) * 10}px) scale(${1 - Math.abs(offset) * 0.05})`,
                          zIndex: cards.length - Math.abs(offset),
                          opacity: Math.abs(offset) <= 1 ? 1 : 0.3,
                          transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
                        }}
                      >
                        {card.content}
                      </SwipeableCard>
                    );
                  })
                  .filter(Boolean);
              })()}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <GlassCard className="p-6">
                <h2 className="text-2xl font-bold text-[#1A1A2E] mb-4">Abstract</h2>
                <p className="text-[#1A1A2E]/80 italic leading-relaxed">{currentArticle.abstract || currentArticle.summary || "No abstract available."}</p>
              </GlassCard>
            </div>
          )}
        </div>
      </div>

      <div className={`flex flex-col gap-3 min-w-[250px] z-10 transition-all duration-300 ${isSidebarOpen ? 'w-1/5 opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-20 overflow-hidden hidden'}`}>
        <GlassCard className="p-4 flex items-center gap-3 shrink-0">
          <div className="p-2 bg-blue-100/50 rounded-lg text-[#0937B8]"><BrainCircuit size={18} /></div>
          <div>
            <h2 className="text-lg font-bold text-[#0937B8]">Analysis</h2>
            <p className="text-xs text-[#1A1A2E]/60">Deconstruct the paper.</p>
          </div>
        </GlassCard>
        
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
          {[
            { id: 'patterns', label: 'Identify Patterns', color: COLORS.primary, icon: Layout, prompt: 'What themes recur across your sources?' },
            { id: 'thesis_impact', label: 'Thesis Impact', color: COLORS.accent, icon: Scale, prompt: 'Does this reinforce or contradict your research question?' },
            { id: 'gaps', label: 'Research Gaps', color: COLORS.secondary, icon: HelpCircle, prompt: 'What is missing? What does this study fail to address?' }
          ].map((item) => (
            <GlassCard key={item.id} className="p-3 flex flex-col gap-2 group hover:border-blue-300/50 transition-colors">
              <div className="flex items-center gap-2 font-bold text-sm" style={{ color: item.color }}>
                <item.icon size={16} />
                {item.label}
              </div>
              <textarea 
                className="w-full h-32 bg-white/50 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:bg-white/80 transition-all resize-none leading-relaxed border border-white/20 placeholder-[#1A1A2E]/40"
                style={{ '--tw-ring-color': item.color }}
                placeholder={item.prompt}
                value={currentArticleNotes[item.id] || ''}
                onChange={(e) => handleNoteChange(item.id, e.target.value)}
              />
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResearchMode;

