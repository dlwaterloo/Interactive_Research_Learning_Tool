import { useState, useRef, useEffect } from 'react';
import { 
  Move, FileText, Type, Image as ImageIcon, BarChart3, Zap, MoreHorizontal,
  Edit3, Trash2, CheckCircle, Sparkles, Loader, X
} from 'lucide-react';
import { NODE_THEMES } from '../../constants/nodeThemes';
import { generateGeminiResponse } from '../../utils/api';

const InteractiveMode = ({ 
  searchQuery, 
  activeArticle,
  nodes, setNodes,
  connections, setConnections
}) => {
  const [tool, setTool] = useState('select'); 
  const [draggingNode, setDraggingNode] = useState(null);
  const [activeMenuNodeId, setActiveMenuNodeId] = useState(null);
  const [editingNodeId, setEditingNodeId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  useEffect(() => {
    if (nodes.length === 0 && !searchQuery && !activeArticle) {
      setNodes([
        { id: 1, type: 'note', theme: 'thesis', x: 400, y: 50, content: 'Research Question: How does AI affect memory retention in undergraduates?', title: 'Central Thesis' },
        { id: 5, type: 'heading', theme: 'heading', x: 150, y: 200, content: 'THEMES', title: 'Themes Heading' },
        { id: 6, type: 'heading', theme: 'heading', x: 650, y: 200, content: 'DATA', title: 'Data Heading' },
        { id: 2, type: 'note', theme: 'evidence', x: 100, y: 300, content: 'Smith (2023) argues that AI acts as a "crutch", reducing short-term recall.', title: 'Critical View' },
        { id: 3, type: 'note', theme: 'evidence', x: 320, y: 300, content: 'Doe (2024) suggests AI offloading allows for deeper processing ("Germane Load").', title: 'Supportive View' },
        { id: 4, type: 'chart', theme: 'data', x: 650, y: 300, content: 'Chart', title: 'Survey Data (n=500)' },
      ]);
      setConnections([ { from: 1, to: 2 }, { from: 1, to: 3 }, { from: 3, to: 4 } ]);
    }
  }, []);

  const generateCanvasNodes = async () => {
    setIsGenerating(true);
    const context = activeArticle 
      ? `the research paper: "${activeArticle.title}" by ${activeArticle.author} (${activeArticle.year}). Summary: ${activeArticle.summary}` 
      : `the research topic: "${searchQuery}"`;
    
    const prompt = `Generate a JSON concept map for ${context}.
    Return ONLY a JSON array of objects with this structure (no markdown code blocks):
    [
      { "id": 1, "type": "note", "theme": "thesis", "x": 400, "y": 50, "content": "The central research question or thesis statement.", "title": "Central Thesis" },
      { "id": 2, "type": "note", "theme": "evidence", "x": 100, "y": 300, "content": "Key supporting argument 1.", "title": "Supporting Evidence" },
      { "id": 3, "type": "note", "theme": "evidence", "x": 320, "y": 300, "content": "Key supporting argument 2.", "title": "Supporting Evidence" },
      { "id": 4, "type": "note", "theme": "counter", "x": 540, "y": 300, "content": "A counter-argument or contrasting view.", "title": "Counter Argument" },
      { "id": 5, "type": "chart", "theme": "data", "x": 760, "y": 300, "content": "Chart", "title": "Key Data Point" }
    ]
    Ensure coordinates (x, y) are spaced out nicely in a tree structure. Use unique numeric IDs.`;

    try {
      const response = await generateGeminiResponse(prompt);
      const cleanedText = response.replace(/```json\n|\n```/g, '');
      const newNodes = JSON.parse(cleanedText);
      
      if (Array.isArray(newNodes)) {
        setNodes(newNodes);
        const root = newNodes.find(n => n.theme === 'thesis');
        if (root) {
          const newConnections = newNodes
            .filter(n => n.id !== root.id)
            .map(n => ({ from: root.id, to: n.id }));
          setConnections(newConnections);
        }
      }
    } catch (e) {
      console.error("Failed to generate nodes", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const getPath = (n1, n2) => {
    if (!n1 || !n2) return '';
    const isHeading1 = n1.type === 'heading';
    const isHeading2 = n2.type === 'heading';
    
    const startX = n1.x + (isHeading1 ? 150 : 100); 
    const startY = n1.y + (isHeading1 ? 25 : 70); 
    const endX = n2.x + (isHeading2 ? 150 : 100);
    const endY = n2.y + (isHeading2 ? 25 : 70);
    
    const deltaX = Math.abs(endX - startX) * 0.5;
    const cp1x = startX + deltaX;
    const cp1y = startY;
    const cp2x = endX - deltaX;
    const cp2y = endY;

    return `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
  };

  const handleMouseDown = (e, nodeId) => {
    if (activeMenuNodeId) { setActiveMenuNodeId(null); }
    if (tool === 'select') { setDraggingNode({ id: nodeId, offsetX: e.nativeEvent.offsetX, offsetY: e.nativeEvent.offsetY }); }
  };

  const handleMouseMove = (e) => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePos({ x, y });

      if (draggingNode) {
        setNodes(nodes.map(n => n.id === draggingNode.id ? { ...n, x: x - draggingNode.offsetX, y: y - draggingNode.offsetY } : n));
      }
    }
  };

  const handleMouseUp = (e) => {
    setDraggingNode(null);
    if (connectingFrom) {
      const target = e.target.closest('[data-node-id]');
      if (target) {
        const targetId = parseInt(target.getAttribute('data-node-id'));
        if (targetId && targetId !== connectingFrom.nodeId) {
          setConnections([...connections, { from: connectingFrom.nodeId, to: targetId }]);
        }
      }
      setConnectingFrom(null);
    }
  };

  const startConnection = (e, nodeId) => {
    e.stopPropagation();
    e.preventDefault();
    const node = nodes.find(n => n.id === nodeId);
    setConnectingFrom({ nodeId, startX: node.x + 200, startY: node.y + 70 });
  };

  const addNode = async (type) => {
    const id = Date.now();
    const startX = Math.random() * 400 + 100;
    const startY = Math.random() * 300 + 100;
    let content = 'New Node';
    let title = 'Untitled';
    let theme = 'default';

    if (type === 'image') { content = 'Image'; title = 'Visual Asset'; }
    if (type === 'chart') { content = 'Chart'; title = 'Data Point'; theme = 'data'; }
    if (type === 'heading') { content = 'NEW SECTION'; title = 'Heading'; theme = 'heading'; }

    if (type === 'insight') {
      content = '⚡ Generating insight...';
      title = 'AI Insight';
      theme = 'insight';
      const tempNode = { id, type, x: startX, y: startY, content, theme, title };
      setNodes(prev => [...prev, tempNode]);
      const insight = await generateGeminiResponse("Generate a short, thought-provoking research insight about AI in Education. Keep it under 15 words.");
      setNodes(prev => prev.map(n => n.id === id ? { ...n, content: insight } : n));
      return;
    }

    setNodes([...nodes, { id, type, x: startX, y: startY, content, theme, title }]);
  };

  const deleteNode = (id) => {
    setNodes(nodes.filter(n => n.id !== id));
    setConnections(connections.filter(c => c.from !== id && c.to !== id));
    setActiveMenuNodeId(null);
  };

  const toggleEdit = (id) => {
    setEditingNodeId(editingNodeId === id ? null : id);
    setActiveMenuNodeId(null);
  };

  const updateNodeTheme = (id, newThemeKey) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, theme: newThemeKey } : n));
  };

  const updateNodeTitle = (id, newTitle) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, title: newTitle } : n));
  };

  return (
    <div className="h-full flex flex-col relative overflow-hidden" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      <div className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-2xl p-2 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] z-30 flex flex-col items-center gap-2 border border-white/40 ring-1 ring-white/50 hover:scale-105 transition-transform duration-300">
        <button onClick={() => setTool('select')} className={`p-3 rounded-xl transition-all ${tool === 'select' ? 'bg-[#0937B8] text-white shadow-lg shadow-blue-500/30' : 'hover:bg-white/20 text-white/80'}`}><Move size={20} /></button>
        <div className="h-px w-8 bg-white/20 my-1"></div>
        <button onClick={() => addNode('note')} className="p-3 rounded-xl hover:bg-purple-500/10 text-white/90 hover:text-[#8A5EFD] transition-all hover:-translate-y-1"><FileText size={20} /></button>
        <button onClick={() => addNode('heading')} className="p-3 rounded-xl hover:bg-white/10 text-white/90 hover:text-white transition-all hover:-translate-y-1"><Type size={20} /></button>
        <button onClick={() => addNode('image')} className="p-3 rounded-xl hover:bg-emerald-500/10 text-white/90 hover:text-emerald-500 transition-all hover:-translate-y-1"><ImageIcon size={20} /></button>
        <button onClick={() => addNode('chart')} className="p-3 rounded-xl hover:bg-amber-500/10 text-white/90 hover:text-amber-500 transition-all hover:-translate-y-1"><BarChart3 size={20} /></button>
        <button onClick={() => addNode('insight')} className="p-3 rounded-xl hover:bg-blue-500/10 text-white/90 hover:text-[#0937B8] transition-all hover:-translate-y-1 group relative">
          <Zap size={20} className="group-hover:fill-current" />
        </button>
      </div>

      {(searchQuery || activeArticle) && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 animate-in fade-in slide-in-from-top-4">
          <button 
            onClick={generateCanvasNodes}
            disabled={isGenerating}
            className="bg-gradient-to-r from-[#FF6FAE] to-[#8A5EFD] text-white px-6 py-3 rounded-full font-bold shadow-xl flex items-center gap-2 hover:scale-105 transition-transform"
          >
            {isGenerating ? <Loader size={18} className="animate-spin" /> : <Sparkles size={18} fill="currentColor" />}
            {isGenerating ? 'Synthesizing Canvas...' : 'Generate Canvas from Research'}
          </button>
        </div>
      )}

      <div 
        ref={canvasRef} 
        className="flex-1 overflow-hidden relative cursor-grab active:cursor-grabbing perspective-1000" 
      >
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none" 
          style={{ 
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.25) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            transform: 'perspective(500px) rotateX(20deg) scale(1.5)',
            transformOrigin: 'top center',
            height: '200%'
          }}>
        </div>

        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-0">
          <defs>
            <filter id="glow-white" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          {connections.map((conn, i) => {
            const n1 = nodes.find(n => n.id === conn.from), n2 = nodes.find(n => n.id === conn.to);
            if (!n1 || !n2) return null;
            return (
              <g key={i}>
                <path d={getPath(n1, n2)} stroke="white" strokeWidth="4" fill="none" opacity="0.4" filter="url(#glow-white)" />
                <path d={getPath(n1, n2)} stroke="white" strokeWidth="2" fill="none" opacity="0.8" />
              </g>
            );
          })}
          {connectingFrom && (
            <path 
              d={`M ${connectingFrom.startX} ${connectingFrom.startY} L ${mousePos.x} ${mousePos.y}`} 
              stroke="#FF6FAE" 
              strokeWidth="2" 
              strokeDasharray="5,5" 
              fill="none" 
              className="animate-pulse"
            />
          )}
        </svg>

        {nodes.map((node) => {
          const theme = NODE_THEMES[node.theme] || NODE_THEMES.default;
          const isHeading = node.type === 'heading';

          return (
            <div 
              key={node.id} 
              data-node-id={node.id}
              onMouseDown={(e) => handleMouseDown(e, node.id)} 
              className={`absolute transition-all duration-300 z-10 hover:z-20 group
                ${isHeading ? 'w-[300px] h-auto' : 'w-[200px] min-h-[140px] flex flex-col rounded-2xl'}
              `}
              style={{ 
                left: node.x, 
                top: node.y, 
                background: isHeading ? 'transparent' : 'rgba(255, 255, 255, 0.15)',
                backdropFilter: isHeading ? 'none' : 'blur(12px)',
                border: isHeading ? 'none' : `1px solid rgba(255,255,255,0.4)`,
                boxShadow: isHeading ? 'none' : `
                  0 15px 35px -5px rgba(0,0,0,0.3), 
                  inset 0 0 20px rgba(255,255,255,0.1)
                `,
                transform: draggingNode?.id === node.id ? 'scale(1.05) translateY(-5px)' : 'scale(1)',
              }}
            >
              {editingNodeId === node.id && !isHeading ? (
                <div className="absolute inset-0 bg-[#1A1A2E]/90 z-50 rounded-2xl p-3 flex flex-col gap-2 border border-white/20 animate-in fade-in zoom-in-95">
                  <div className="flex justify-between items-center text-white/50 text-xs font-bold uppercase">
                    Edit Node <button onClick={() => setEditingNodeId(null)}><X size={14}/></button>
                  </div>
                  <input 
                    className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-sm focus:outline-none"
                    value={node.title}
                    onChange={(e) => updateNodeTitle(node.id, e.target.value)}
                  />
                  <div className="flex gap-2 flex-wrap mt-1">
                    {Object.entries(NODE_THEMES).filter(([k]) => k !== 'heading').map(([key, t]) => (
                      <button 
                        key={key}
                        onClick={() => updateNodeTheme(node.id, key)}
                        className={`w-6 h-6 rounded-full border border-white/30 flex items-center justify-center hover:scale-110 transition-transform ${node.theme === key ? 'ring-2 ring-white' : ''}`}
                        style={{ backgroundColor: t.color }}
                        title={t.label}
                      >
                        {node.theme === key && <CheckCircle size={12} className="text-white"/>}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {isHeading ? (
                <div className="group relative">
                  <textarea 
                    className="w-full bg-transparent text-4xl font-black text-white/90 border-none outline-none resize-none overflow-hidden placeholder-white/20 leading-tight tracking-tight drop-shadow-lg"
                    value={node.content}
                    rows={1}
                    onChange={(e) => {
                      const newNodes = nodes.map(n => n.id === node.id ? { ...n, content: e.target.value } : n);
                      setNodes(newNodes);
                    }}
                    style={{ height: 'auto', minHeight: '60px' }}
                  />
                  <div className="absolute -right-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => deleteNode(node.id)} className="p-2 bg-red-500/80 rounded-full text-white hover:bg-red-500"><Trash2 size={16}/></button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="h-8 px-3 flex items-center justify-between rounded-t-2xl border-b border-white/20 bg-black/10">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: theme.color }}></div>
                      <span className="text-[10px] font-bold uppercase tracking-wider truncate max-w-[120px]" style={{ color: theme.color }}>{theme.label}</span>
                    </div>
                    <div className="relative" onMouseDown={(e) => e.stopPropagation()}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveMenuNodeId(activeMenuNodeId === node.id ? null : node.id); }}
                        className="text-white/50 hover:text-white transition-colors"
                      >
                        <MoreHorizontal size={14} />
                      </button>
                      
                      {activeMenuNodeId === node.id && (
                        <div className="absolute right-0 top-6 w-36 bg-[#1A1A2E] border border-white/20 rounded-xl shadow-2xl p-1 z-50 animate-in fade-in slide-in-from-top-1 backdrop-blur-xl">
                          <button 
                            onClick={() => toggleEdit(node.id)}
                            className="w-full text-left px-3 py-2 rounded-lg text-white hover:bg-white/10 text-xs font-bold flex items-center gap-2 transition-colors mb-1"
                          >
                            <Edit3 size={12} /> Edit Node
                          </button>
                          <div className="h-px bg-white/10 my-1"></div>
                          <button 
                            onClick={() => deleteNode(node.id)}
                            className="w-full text-left px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 text-xs font-bold flex items-center gap-2 transition-colors"
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 p-3 relative hover:bg-white/5 transition-colors rounded-b-2xl">
                    <div className="text-xs font-bold text-white mb-1 truncate opacity-90">{node.title}</div>
                    {node.type === 'image' ? (
                      <div className="w-full h-24 bg-black/20 rounded-lg flex items-center justify-center overflow-hidden border border-white/10 relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent"></div>
                        <ImageIcon size={32} className="text-emerald-400 relative z-10"/>
                      </div>
                    ) : node.type === 'chart' ? (
                      <div className="w-full h-24 bg-black/20 rounded-lg flex items-center justify-center border border-white/10 relative p-2">
                        <div className="flex items-end gap-1 h-full w-full justify-around">
                          <div className="w-3 bg-amber-400/80 rounded-t-sm h-[40%]"></div>
                          <div className="w-3 bg-amber-500/80 rounded-t-sm h-[70%]"></div>
                          <div className="w-3 bg-amber-300/80 rounded-t-sm h-[50%]"></div>
                          <div className="w-3 bg-amber-600/80 rounded-t-sm h-[85%]"></div>
                        </div>
                      </div>
                    ) : (
                      <textarea 
                        className="w-full h-full bg-transparent border-none resize-none focus:outline-none text-xs font-medium text-white/80 leading-relaxed placeholder-white/30"
                        value={node.content}
                        spellCheck={false}
                        onChange={(e) => { const newNodes = nodes.map(n => n.id === node.id ? { ...n, content: e.target.value } : n); setNodes(newNodes); }}
                      />
                    )}
                  </div>
                  
                  <div 
                    onMouseDown={(e) => startConnection(e, node.id)}
                    className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center cursor-crosshair group/handle z-30"
                  >
                    <div className="w-3 h-3 bg-white border-2 border-[#1A1A2E] rounded-full shadow-[0_0_10px_white] transition-transform group-hover/handle:scale-125"></div>
                  </div>
                  <div 
                    onMouseDown={(e) => startConnection(e, node.id)}
                    className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center cursor-crosshair group/handle z-30"
                  >
                    <div className="w-3 h-3 bg-white border-2 border-[#1A1A2E] rounded-full shadow-[0_0_10px_white] transition-transform group-hover/handle:scale-125"></div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InteractiveMode;

