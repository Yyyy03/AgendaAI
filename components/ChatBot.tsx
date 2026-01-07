import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Minimize2, Maximize2, Loader2 } from 'lucide-react';
import { ChatMessage, UploadedFile, AnalysisResult } from '../types';
import { createChatSession } from '../services/geminiService';

interface ChatBotProps {
  file: UploadedFile | null;
  analysis: AnalysisResult | null;
}

const ChatBot: React.FC<ChatBotProps> = ({ file, analysis }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Store the chat session instance
  const chatSessionRef = useRef<{ sendMessage: (msg: string, isFirst?: boolean) => Promise<string | undefined> } | null>(null);

  // Initialize session when file/analysis changes
  useEffect(() => {
    if (file && analysis) {
      chatSessionRef.current = createChatSession(file.data, file.mimeType, analysis);
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          text: `Hi! I've analyzed "${file.name}". You can ask me questions about the agenda, stakeholders, or specific details in the document.`,
          timestamp: Date.now()
        }
      ]);
    } else {
      chatSessionRef.current = null;
      setMessages([]);
    }
  }, [file, analysis]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim() || !chatSessionRef.current || isSending) return;

    const userText = inputValue;
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setIsSending(true);

    try {
        // Determine if this is the first real user message to send the file context
        const isFirstUserMessage = messages.filter(m => m.role === 'user').length === 0;
        
        const responseText = await chatSessionRef.current.sendMessage(userText, isFirstUserMessage);
        
        if (responseText) {
            const botMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: responseText,
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, botMessage]);
        }
    } catch (error) {
        console.error("Chat error", error);
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'model',
            text: "I'm sorry, I encountered an error processing your request. Please try again.",
            timestamp: Date.now()
        }]);
    } finally {
        setIsSending(false);
    }
  };

  if (!file) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end transition-all duration-300 ${isOpen ? 'w-96' : 'w-auto'}`}>
      
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[500px] animate-in slide-in-from-bottom-5 fade-in duration-200">
          {/* Header */}
          <div className="bg-indigo-600 p-4 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <span className="font-semibold">Agenda Assistant</span>
            </div>
            <button 
                onClick={() => setIsOpen(false)}
                className="hover:bg-indigo-700 p-1.5 rounded-full transition-colors"
            >
              <Minimize2 size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'
                }`}>
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isSending && (
                <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <Bot size={14} />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                        <div className="flex gap-1">
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                        </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-slate-100 shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about the agenda..."
                className="flex-1 bg-slate-100 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl px-4 py-2 text-sm outline-none transition-all"
                disabled={isSending}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isSending}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl p-2.5 transition-colors flex items-center justify-center"
              >
                {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
            <div className="text-center mt-2">
                 <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Powered by Gemini 3.0 Pro</span>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3.5 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        >
          <MessageSquare size={20} />
          <span className="font-medium">Ask Assistant</span>
        </button>
      )}
    </div>
  );
};

export default ChatBot;