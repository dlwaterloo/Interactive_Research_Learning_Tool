import { useState } from 'react';
import { 
  ArrowLeft, CheckCircle, Lock, Zap, CheckSquare, ChevronRight,
  PenTool, FileText, Bookmark, Quote, Sparkles, Loader
} from 'lucide-react';
import ChatModal from './ChatModal';
import { generateGeminiResponse } from '../utils/api';

const LearningModulesSidebar = ({ className = "", modules, setModules }) => {
  const [activeTaskState, setActiveTaskState] = useState(null);
  const [expandedModule, setExpandedModule] = useState(modules[0]?.id || 'keywords');
  const [showChat, setShowChat] = useState(false);

  const calculateProgress = () => {
    let totalXp = 0;
    let earnedXp = 0;

    modules.forEach(module => {
      totalXp += module.xp;
      if (module.tasks && module.tasks.length > 0) {
        const completedTasksCount = module.tasks.filter(t => t.done).length;
        const moduleProgress = completedTasksCount / module.tasks.length;
        earnedXp += module.xp * moduleProgress;
      } else if (module.completed) {
        earnedXp += module.xp;
      }
    });

    return totalXp > 0 ? (earnedXp / totalXp) * 100 : 0;
  };

  const progress = calculateProgress();

  const [keywordInput, setKeywordInput] = useState('');
  const [keywordResult, setKeywordResult] = useState('');
  const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false);

  const handleKeywordGeneration = async () => {
    if (!keywordInput.trim()) return;
    setIsGeneratingKeywords(true);
    const prompt = `Extract 3-5 academic search keywords and 2-3 synonyms for each from this research question: "${keywordInput}". Format as a clean list. Do not use conversational text.`;
    const result = await generateGeminiResponse(prompt);
    setKeywordResult(result);
    setIsGeneratingKeywords(false);
  };

  const toggleTask = (moduleId, taskId, currentDoneState) => {
    setModules(prevModules => prevModules.map(module => {
      if (module.id !== moduleId) return module;

      const updatedTasks = module.tasks.map(task => 
        task.id === taskId ? { ...task, done: !currentDoneState } : task
      );

      const allTasksDone = updatedTasks.every(t => t.done);

      return {
        ...module,
        tasks: updatedTasks,
        completed: allTasksDone
      };
    }));
  };

  const handleTaskInput = (moduleId, taskId, inputVal) => {
    setModules(prevModules => prevModules.map(module => {
      if (module.id !== moduleId) return module;
      return {
        ...module,
        tasks: module.tasks.map(task => 
          task.id === taskId ? { ...task, userInput: inputVal } : task
        )
      };
    }));
  };

  const completeActiveTask = () => {
    if (!activeTaskState) return;

    setModules(prevModules => prevModules.map(module => {
      if (module.id !== activeTaskState.moduleId) return module;

      const updatedTasks = module.tasks.map(task => 
        task.id === activeTaskState.taskId ? { ...task, done: true } : task
      );

      const allTasksDone = updatedTasks.every(t => t.done);

      return {
        ...module,
        tasks: updatedTasks,
        completed: allTasksDone
      };
    }));
    
    setActiveTaskState(null);
  };

  const currentActiveModule = activeTaskState ? modules.find(m => m.id === activeTaskState.moduleId) : null;
  const currentActiveTask = currentActiveModule ? currentActiveModule.tasks.find(t => t.id === activeTaskState.taskId) : null;
  const currentActiveModuleId = activeTaskState?.moduleId;

  return (
    <div className={`rounded-3xl shadow-2xl overflow-hidden h-full flex flex-col relative border border-white/40 ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-[#6b21a8]/90 via-[#4c1d95]/90 to-[#0937B8]/90 backdrop-blur-xl"></div>
      
      <div className="relative z-10 p-6 pb-2 text-white">
        <div className="text-xs font-bold opacity-70 mb-1 uppercase tracking-wider">Research Level: Foundations</div>
        <h2 className="text-2xl font-bold mb-1 drop-shadow-md truncate">Your Quest: Lit Review</h2>
        
        {!activeTaskState && (
          <div className="mt-3">
            <div className="mb-2 flex justify-between text-xs font-bold opacity-90">
              <span>Quest Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden border border-white/10 backdrop-blur-sm">
              <div className="h-full bg-gradient-to-r from-[#FF6FAE] to-[#d8b4fe] rounded-full shadow-[0_0_10px_rgba(255,111,174,0.5)] transition-all duration-1000" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 relative z-10 custom-scrollbar">
        {activeTaskState && currentActiveTask ? (
          <div className="h-full flex flex-col animate-in slide-in-from-right duration-300">
            <button 
              onClick={() => setActiveTaskState(null)}
              className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors font-bold text-sm"
            >
              <div className="p-1 rounded-full bg-white/10">
                <ArrowLeft size={16} />
              </div>
              Back to Modules
            </button>

            <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl p-6 flex-1 flex flex-col shadow-lg">
              <div className="flex items-center gap-2 text-[#FF6FAE] mb-2 font-bold uppercase text-xs tracking-widest">
                {currentActiveTask.type}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{currentActiveTask.content.title}</h3>
              <div className="text-white/90 leading-relaxed text-sm whitespace-pre-line flex-1 mb-4">
                {typeof currentActiveTask.content.body === 'string' 
                  ? currentActiveTask.content.body 
                  : JSON.stringify(currentActiveTask.content.body)}
              </div>

              {currentActiveTask.content.interaction && (
                <div className="mb-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="bg-black/20 p-4 rounded-xl border border-white/10">
                    {currentActiveTask.content.interaction.type === 'text' && (
                      <>
                        <div className="text-xs font-bold text-[#8A5EFD] uppercase mb-2 flex items-center gap-2">
                          <PenTool size={12}/> Your Answer
                        </div>
                        <textarea 
                          className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#8A5EFD] transition-all placeholder-white/30 resize-none h-24"
                          placeholder={currentActiveTask.content.interaction.placeholder}
                          value={currentActiveTask.userInput || ''}
                          onChange={(e) => handleTaskInput(currentActiveModuleId, currentActiveTask.id, e.target.value)}
                        />
                      </>
                    )}
                    {currentActiveTask.content.interaction.type === 'choice' && (
                      <>
                        <div className="text-xs font-bold text-[#8A5EFD] uppercase mb-2 flex items-center gap-2">
                          <CheckCircle size={12}/> {currentActiveTask.content.interaction.question}
                        </div>
                        <div className="space-y-2">
                          {currentActiveTask.content.interaction.options.map((option, idx) => (
                            <button 
                              key={idx}
                              onClick={() => handleTaskInput(currentActiveModuleId, currentActiveTask.id, option)}
                              className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all border ${currentActiveTask.userInput === option ? 'bg-[#8A5EFD] border-[#8A5EFD] text-white font-bold shadow-lg' : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'}`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              {currentActiveTask.id === 't3' && (
                <div className="mt-2 p-4 bg-black/20 rounded-xl border border-white/10 space-y-3">
                  <div className="flex items-center gap-2 text-white/80 text-xs font-bold uppercase"><Sparkles size={12} className="text-[#FF6FAE]" /> AI Powered Tool</div>
                  <input 
                    type="text" 
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    placeholder="e.g., How does sleep affect memory?" 
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 text-sm focus:outline-none focus:border-[#FF6FAE] transition-colors"
                  />
                  <button 
                    onClick={handleKeywordGeneration}
                    disabled={isGeneratingKeywords || !keywordInput}
                    className="w-full py-2 bg-[#FF6FAE] text-white rounded-lg text-xs font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                  >
                    {isGeneratingKeywords ? <Loader size={14} className="animate-spin"/> : <Zap size={14} fill="currentColor"/>}
                    {isGeneratingKeywords ? 'Analyzing...' : 'Extract Keywords with Gemini'}
                  </button>
                  
                  {keywordResult && (
                    <div className="mt-3 p-3 bg-white/10 rounded-lg border border-white/10 animate-in fade-in slide-in-from-top-2">
                      <div className="text-xs text-white/60 mb-1 font-bold">SUGGESTED KEYWORDS:</div>
                      <div className="text-sm text-white whitespace-pre-line">{keywordResult}</div>
                    </div>
                  )}
                </div>
              )}
              
              <button 
                onClick={completeActiveTask} 
                className="mt-auto w-full py-3 bg-white text-[#0937B8] rounded-xl font-bold text-sm hover:bg-opacity-90 shadow-lg flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} /> Complete Lesson
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {modules.map((module, index) => {
              const isActive = !module.completed && (index === 0 || modules[index - 1].completed);
              const isLocked = !module.completed && !isActive;
              return (
                <div key={module.id} className={`rounded-2xl border transition-all duration-300 overflow-hidden backdrop-blur-md ${isActive ? 'bg-white/20 border-white/30 shadow-lg' : 'bg-white/5 border-white/10 opacity-80 hover:opacity-100'}`}>
                  <div onClick={() => !isLocked && setExpandedModule(expandedModule === module.id ? null : module.id)} className={`p-4 cursor-pointer ${isLocked ? 'cursor-not-allowed' : ''}`}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2 text-white/90">
                        {module.completed ? <CheckCircle size={18} className="text-[#FF6FAE]" /> : isLocked ? <Lock size={16} className="text-white/40" /> : <Zap size={18} className="text-[#FF6FAE]" fill="currentColor" />}
                        <span className={`font-bold text-sm ${isActive ? 'text-white' : 'text-white/70'}`}>{module.lesson}: {module.title}</span>
                      </div>
                      {isActive && <span className="text-[10px] font-bold bg-[#FF6FAE] text-white px-2 py-0.5 rounded-full">Active</span>}
                      {isLocked && <span className="text-[10px] font-bold text-white/30">Locked</span>}
                    </div>
                    {!isLocked && (
                      <div className={`mt-3 space-y-2 transition-all duration-300 ${expandedModule === module.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                        {module.tasks.map((task) => (
                          <div 
                            key={task.id} 
                            onClick={(e) => { e.stopPropagation(); setActiveTaskState({ moduleId: module.id, taskId: task.id }); }} 
                            className="flex items-start gap-3 group cursor-pointer hover:bg-white/10 p-2 rounded-lg -mx-2 transition-colors"
                          >
                            <div 
                              onClick={(e) => { 
                                e.stopPropagation();
                                toggleTask(module.id, task.id, task.done); 
                              }}
                              className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer hover:border-white ${task.done ? 'bg-[#FF6FAE] border-[#FF6FAE]' : 'border-white/40 bg-white/5'}`}
                            >
                              {task.done && <CheckSquare size={10} className="text-white" />}
                            </div>
                            <div className="flex flex-col"><span className={`text-xs leading-snug font-medium transition-colors ${task.done ? 'text-white/60' : 'text-white group-hover:text-[#FF6FAE]'}`}>{task.text}</span><span className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">{task.type}</span></div>
                            <ChevronRight size={14} className="ml-auto text-white/20 group-hover:text-white/80" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            <div className="bg-white/10 border border-white/20 rounded-2xl p-4 backdrop-blur-md mt-6">
              <h3 className="text-white font-bold text-sm mb-3">Your Toolkit</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/90 text-xs font-bold flex items-center gap-2 transition-colors border border-white/5"><FileText size={14} className="text-[#8A5EFD]"/> My Notes</button>
                <button className="w-full text-left px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/90 text-xs font-bold flex items-center gap-2 transition-colors border border-white/5"><Bookmark size={14} className="text-[#8A5EFD]"/> Saved Resources</button>
                <button className="w-full text-left px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/90 text-xs font-bold flex items-center gap-2 transition-colors border border-white/5"><Quote size={14} className="text-[#8A5EFD]"/> Citation Helper</button>
              </div>
            </div>

            <div className="bg-white/10 border border-white/20 rounded-2xl p-4 backdrop-blur-md mt-4">
              <h3 className="text-white font-bold text-sm mb-3">Need Help?</h3>
              <button 
                onClick={() => setShowChat(!showChat)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#8A5EFD] to-[#0937B8] hover:opacity-90 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02]"
              >
                <Sparkles size={14} /> Ask AI Research Assistant
              </button>
            </div>
          </div>
        )}
      </div>

      {showChat && <ChatModal onClose={() => setShowChat(false)} />}
    </div>
  );
};

export default LearningModulesSidebar;

