import { useState, useRef, useEffect } from 'react';
import { X, Send, Loader, Sparkles } from 'lucide-react';
import { generateGeminiResponse } from '../utils/api';

const ChatModal = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! I am your AI Research Assistant. I can help you clarify concepts, suggest search terms, or summarize methodologies. What are you working on?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    const prompt = `You are an expert academic research assistant named QUIREY AI. 
    The user asked: "${userMsg}". 
    Provide a helpful, concise, and academically rigorous answer. 
    If they ask for search terms, format them as a bulleted list. 
    If they ask about a concept, explain it simply but accurately.`;

    const response = await generateGeminiResponse(prompt);
    const textResponse = typeof response === 'object' ? JSON.stringify(response) : String(response);
    setMessages(prev => [...prev, { role: 'ai', text: textResponse }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-24 right-8 w-96 h-[500px] bg-white/90 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl flex flex-col z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-[#0937B8] to-[#8A5EFD] rounded-t-3xl text-white">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-[#FF6FAE]" />
          <span className="font-bold">Research Assistant</span>
        </div>
        <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full"><X size={18} /></button>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-[#0937B8] text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'}`}>
              {typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text)}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
              <Loader size={14} className="animate-spin text-[#8A5EFD]" />
              <span className="text-xs text-gray-500">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-100 bg-white/50">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-2 py-1 focus-within:ring-2 focus-within:ring-[#8A5EFD] transition-all">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question..." 
            className="flex-1 bg-transparent border-none focus:outline-none text-sm p-2"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-2 bg-[#0937B8] text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;

