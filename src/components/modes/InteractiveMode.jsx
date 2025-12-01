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

  // Auto-generate canvas when activeArticle is set (e.g., from Research mode)
  // Regenerate if activeArticle changes (different paper selected)
  const prevArticleIdRef = useRef(null);
  const lastGeneratedArticleRef = useRef(null);
  
  useEffect(() => {
    if (activeArticle && !isGenerating && !searchQuery) {
      // Get unique identifier for the article
      const articleId = activeArticle.id || activeArticle.title || JSON.stringify(activeArticle);
      const prevArticleId = prevArticleIdRef.current;
      const lastGeneratedId = lastGeneratedArticleRef.current;
      
      // Regenerate if:
      // 1. This is a different article than before
      // 2. Canvas is empty
      // 3. We haven't generated for this article yet (even if same ID, might be different instance)
      const shouldRegenerate = articleId !== lastGeneratedId || nodes.length === 0;
      
      if (shouldRegenerate) {
        // Clear existing nodes when switching to a new article
        if (articleId !== lastGeneratedId) {
          setNodes([]);
          setConnections([]);
        }
        
        // Small delay to ensure component is mounted
        const timer = setTimeout(async () => {
          await generateCanvasNodes();
          // Mark this article as generated after successful generation
          lastGeneratedArticleRef.current = articleId;
        }, 100);
        
        prevArticleIdRef.current = articleId;
        return () => clearTimeout(timer);
      }
    } else if (!activeArticle) {
      // Reset refs when no article is selected
      prevArticleIdRef.current = null;
      lastGeneratedArticleRef.current = null;
    }
  }, [activeArticle, isGenerating, searchQuery]);

  const generateCanvasNodes = async () => {
    setIsGenerating(true);
    const context = activeArticle 
      ? `the research paper: "${activeArticle.title}" by ${activeArticle.author} (${activeArticle.year}). Summary: ${activeArticle.summary}` 
      : `the research topic: "${searchQuery}"`;
    
    const prompt = `Generate a JSON concept map for ${context}.
    Return ONLY a JSON array of objects with this structure (no markdown code blocks):
    [
      { "id": 1, "type": "note", "theme": "thesis", "content": "The central research question or thesis statement.", "title": "Central Thesis" },
      { "id": 2, "type": "note", "theme": "evidence", "content": "Key supporting argument 1.", "title": "Supporting Evidence" },
      { "id": 3, "type": "note", "theme": "evidence", "content": "Key supporting argument 2.", "title": "Supporting Evidence" },
      { "id": 4, "type": "note", "theme": "counter", "content": "A counter-argument or contrasting view.", "title": "Counter Argument" },
      { "id": 5, "type": "chart", "theme": "data", "content": "Chart", "title": "Key Data Point" }
    ]
    Do NOT include x and y coordinates. Just provide the node data. Use unique numeric IDs.`;

    try {
      const response = await generateGeminiResponse(prompt);
      const cleanedText = response.replace(/```json\n|\n```/g, '');
      const newNodes = JSON.parse(cleanedText);
      
      if (Array.isArray(newNodes)) {
        // Get canvas dimensions - use viewport if canvas not yet mounted
        const canvasWidth = canvasRef.current?.clientWidth || (window.innerWidth - 100);
        const canvasHeight = canvasRef.current?.clientHeight || (window.innerHeight - 200);
        
        // Calculate center of canvas
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        
        // Node dimensions
        const nodeWidth = 250;
        const nodeHeight = 200;
        const padding = 100;
        const minDistance = Math.max(nodeWidth, nodeHeight) + 40; // Minimum distance between nodes
        const levelSpacing = 350; // Distance between hierarchy levels
        
        // Find root node (thesis or first node)
        const root = newNodes.find(n => n.theme === 'thesis') || newNodes[0];
        const otherNodes = newNodes.filter(n => n.id !== root.id);
        
        // Group nodes by theme for better organization
        const nodesByTheme = {};
        otherNodes.forEach(node => {
          const theme = node.theme || 'default';
          if (!nodesByTheme[theme]) {
            nodesByTheme[theme] = [];
          }
          nodesByTheme[theme].push(node);
        });
        
        const themes = Object.keys(nodesByTheme);
        const totalNodes = otherNodes.length;
        
        // Position root at center, ensuring it's within bounds
        const rootX = Math.max(padding, Math.min(canvasWidth - nodeWidth - padding, centerX - nodeWidth / 2));
        const rootY = Math.max(padding, Math.min(canvasHeight - nodeHeight - padding, centerY - nodeHeight / 2));
        const positionedNodes = [{
          ...root,
          x: rootX,
          y: rootY
        }];
        
        // Helper function to check if a position overlaps with existing nodes
        const checkOverlap = (x, y, existingNodes) => {
          // First check if position is within screen bounds
          if (x < padding || y < padding || 
              x + nodeWidth > canvasWidth - padding || 
              y + nodeHeight > canvasHeight - padding) {
            return true; // Out of bounds counts as overlap
          }
          
          for (const existing of existingNodes) {
            const ex = existing.x;
            const ey = existing.y;
            
            // Check if rectangles overlap (with buffer)
            const buffer = 10; // Small buffer to prevent touching
            const overlapX = !(x + nodeWidth + buffer < ex || x - buffer > ex + nodeWidth);
            const overlapY = !(y + nodeHeight + buffer < ey || y - buffer > ey + nodeHeight);
            if (overlapX && overlapY) {
              return true;
            }
            
            // Also check minimum distance between centers
            const centerX1 = x + nodeWidth / 2;
            const centerY1 = y + nodeHeight / 2;
            const centerX2 = ex + nodeWidth / 2;
            const centerY2 = ey + nodeHeight / 2;
            const distance = Math.sqrt(Math.pow(centerX1 - centerX2, 2) + Math.pow(centerY1 - centerY2, 2));
            if (distance < minDistance) {
              return true;
            }
          }
          return false;
        };
        
        // Helper function to find a non-overlapping position within screen bounds
        const findNonOverlappingPosition = (desiredX, desiredY, existingNodes, maxAttempts = 50) => {
          // Ensure desired position is within bounds first
          let boundedDesiredX = Math.max(padding, Math.min(canvasWidth - nodeWidth - padding, desiredX));
          let boundedDesiredY = Math.max(padding, Math.min(canvasHeight - nodeHeight - padding, desiredY));
          
          // Try the bounded desired position first
          if (!checkOverlap(boundedDesiredX, boundedDesiredY, existingNodes)) {
            return { x: boundedDesiredX, y: boundedDesiredY };
          }
          
          // Try positions in a spiral pattern around the desired position
          const spiralRadius = minDistance;
          const maxRadius = Math.min(canvasWidth - nodeWidth - 2 * padding, canvasHeight - nodeHeight - 2 * padding) / 2;
          let attempts = 0;
          
          for (let radius = spiralRadius; radius < maxRadius && attempts < maxAttempts; radius += 40) {
            const angleSteps = Math.max(12, Math.floor(radius / 30));
            for (let i = 0; i < angleSteps && attempts < maxAttempts; i++) {
              const angle = (i / angleSteps) * 2 * Math.PI;
              let x = boundedDesiredX + Math.cos(angle) * radius;
              let y = boundedDesiredY + Math.sin(angle) * radius;
              
              // Ensure within bounds
              x = Math.max(padding, Math.min(canvasWidth - nodeWidth - padding, x));
              y = Math.max(padding, Math.min(canvasHeight - nodeHeight - padding, y));
              
              if (!checkOverlap(x, y, existingNodes)) {
                return { x, y };
              }
              attempts++;
            }
          }
          
          // If spiral search fails, try a grid search
          const gridStep = minDistance;
          const startX = padding;
          const startY = padding;
          const endX = canvasWidth - nodeWidth - padding;
          const endY = canvasHeight - nodeHeight - padding;
          
          for (let y = startY; y <= endY && attempts < maxAttempts; y += gridStep) {
            for (let x = startX; x <= endX && attempts < maxAttempts; x += gridStep) {
              if (!checkOverlap(x, y, existingNodes)) {
                return { x, y };
              }
              attempts++;
            }
          }
          
          // Last resort: return a safe position at the edge (shouldn't happen with proper spacing)
          return {
            x: padding,
            y: padding + (existingNodes.length * (nodeHeight + 20))
          };
        };
        
        // Create a beautiful hierarchical layout
        // Level 1: Root at center
        // Level 2: Nodes arranged in organized groups around root
        
        if (totalNodes <= 4) {
          // For few nodes: simple radial layout
          const radius = Math.min(canvasWidth, canvasHeight) * 0.25;
          const angleStep = (2 * Math.PI) / totalNodes;
          const startAngle = -Math.PI / 2; // Start from top
          
          otherNodes.forEach((node, index) => {
            const angle = startAngle + index * angleStep;
            const desiredX = centerX + Math.cos(angle) * radius - nodeWidth / 2;
            const desiredY = centerY + Math.sin(angle) * radius - nodeHeight / 2;
            const { x, y } = findNonOverlappingPosition(desiredX, desiredY, positionedNodes);
            positionedNodes.push({ ...node, x, y });
          });
        } else {
          // For more nodes: organized by theme in sectors
          const sectors = themes.length;
          const sectorAngle = (2 * Math.PI) / sectors;
          const baseRadius = Math.min(canvasWidth, canvasHeight) * 0.28;
          
          themes.forEach((theme, themeIndex) => {
            const themeNodes = nodesByTheme[theme];
            const nodesInTheme = themeNodes.length;
            
            // Calculate sector center angle
            const sectorCenterAngle = -Math.PI / 2 + themeIndex * sectorAngle;
            
            // Arrange nodes in this theme in a fan pattern
            themeNodes.forEach((node, nodeIndex) => {
              // Spread nodes within the sector
              const angleSpread = sectorAngle * 0.7; // Use 70% of sector
              const nodeAngle = sectorCenterAngle - angleSpread / 2 + (nodeIndex / (nodesInTheme - 1 || 1)) * angleSpread;
              
              // Vary radius slightly for visual interest
              const radiusVariation = (nodeIndex % 2 === 0 ? 1 : 1.15);
              const radius = baseRadius * radiusVariation;
              
              const desiredX = centerX + Math.cos(nodeAngle) * radius - nodeWidth / 2;
              const desiredY = centerY + Math.sin(nodeAngle) * radius - nodeHeight / 2;
              
              const { x, y } = findNonOverlappingPosition(desiredX, desiredY, positionedNodes);
              positionedNodes.push({ ...node, x, y });
            });
          });
        }
        
        setNodes(positionedNodes);
        
        // Create connections from root to all other nodes
        if (root) {
          const newConnections = otherNodes.map(n => ({ from: root.id, to: n.id }));
          setConnections(newConnections);
        }
        
        // Scroll to center the root node in viewport after a short delay
        setTimeout(() => {
          if (canvasRef.current && root) {
            const rootNode = positionedNodes.find(n => n.id === root.id);
            if (rootNode) {
              const canvasRect = canvasRef.current.getBoundingClientRect();
              const scrollX = rootNode.x + 125 - canvasRect.width / 2;
              const scrollY = rootNode.y + 100 - canvasRect.height / 2;
              canvasRef.current.scrollTo({
                left: Math.max(0, scrollX),
                top: Math.max(0, scrollY),
                behavior: 'smooth'
              });
            }
          }
        }, 100);
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
        const nodeWidth = 250;
        const nodeHeight = 200;
        const padding = 20;
        
        // Get canvas dimensions
        const canvasWidth = canvasRef.current?.clientWidth || window.innerWidth;
        const canvasHeight = canvasRef.current?.clientHeight || window.innerHeight;
        
        // Calculate new position
        let newX = x - draggingNode.offsetX;
        let newY = y - draggingNode.offsetY;
        
        // Constrain to canvas bounds
        newX = Math.max(padding, Math.min(canvasWidth - nodeWidth - padding, newX));
        newY = Math.max(padding, Math.min(canvasHeight - nodeHeight - padding, newY));
        
        setNodes(nodes.map(n => n.id === draggingNode.id ? { ...n, x: newX, y: newY } : n));
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
    const canvasWidth = canvasRef.current?.clientWidth || (window.innerWidth - 100);
    const canvasHeight = canvasRef.current?.clientHeight || (window.innerHeight - 200);
    const nodeWidth = 250;
    const nodeHeight = 200;
    const padding = 20;
    
    // Place new node in visible area, avoiding overlap
    const startX = Math.max(padding, Math.min(canvasWidth - nodeWidth - padding, Math.random() * (canvasWidth - nodeWidth - 2 * padding) + padding));
    const startY = Math.max(padding, Math.min(canvasHeight - nodeHeight - padding, Math.random() * (canvasHeight - nodeHeight - 2 * padding) + padding));
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
        className="flex-1 overflow-auto relative cursor-grab active:cursor-grabbing perspective-1000 custom-scrollbar" 
        style={{ minHeight: 0 }}
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
                ${isHeading ? 'w-[300px] h-auto' : 'w-[250px] min-h-[140px] flex flex-col rounded-2xl'}
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
                maxWidth: isHeading ? '300px' : '400px',
                overflow: 'visible',
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
                      <span className="text-[10px] font-bold uppercase tracking-wider break-words" style={{ color: theme.color }}>{theme.label}</span>
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
                    <div className="text-xs font-bold text-white mb-1 break-words opacity-90">{node.title}</div>
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
                        className="w-full min-h-[60px] bg-transparent border-none resize-none focus:outline-none text-xs font-medium text-white/80 leading-relaxed placeholder-white/30 overflow-visible"
                        value={node.content}
                        spellCheck={false}
                        rows={Math.max(3, Math.ceil(node.content.length / 40))}
                        style={{ height: 'auto', minHeight: '60px' }}
                        onChange={(e) => { 
                          const newNodes = nodes.map(n => n.id === node.id ? { ...n, content: e.target.value } : n); 
                          setNodes(newNodes);
                          // Auto-resize textarea
                          e.target.style.height = 'auto';
                          e.target.style.height = Math.max(60, e.target.scrollHeight) + 'px';
                        }}
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

