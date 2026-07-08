import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, Sparkles, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Respuestas predefinidas del bot
const BOT_RESPONSES: Record<string, string> = {
  '¿cuándo nació katary': 'Katary nació en 2018 como una iniciativa para conectar equipos de trabajo remotos.',
  '¿quién es el gerente': 'El gerente general de Katary es Carlos Mendoza, fundador y líder del proyecto.',
  '¿qué es katary': 'Katary es una plataforma de comunidad y colaboración para equipos de trabajo, diseñada para conectar personas y potenciar la cultura organizacional.',
  '¿cómo puedo cambiar mi foto': 'Puedes cambiar tu foto de perfil desde tu tarjeta de perfil. Haz clic en el lápiz (✏️) que aparece en tu avatar y selecciona la opción de subir foto.',
  '¿cómo me inscribo a una actividad': 'Ve a la sección "Actividades y eventos", encuentra la actividad que te interesa y haz clic en el botón "Participaré".',
  '¿qué son los hobbies': 'Los hobbies son intereses personales que puedes agregar a tu perfil para conectar con otros colaboradores que compartan tus gustos.',
  '¿cómo funciona conecta360': 'Conecta360 es un espacio donde puedes ver las tarjetas de perfil de tus compañeros, conocer sus hobbies y reaccionar a sus publicaciones.',
  'default': '📚 No tengo esa información todavía. Pero puedes preguntarme sobre: ¿Qué es Katary?, ¿Quién es el gerente?, ¿Cómo cambio mi foto?, ¿Cómo me inscribo a una actividad?, ¿Qué son los hobbies?, ¿Cómo funciona Conecta360?'
};

export function KatariBot() {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: '👋 ¡Hola! Soy Katari Bot. Pregúntame sobre la empresa, actividades o cómo funciona la plataforma.',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const suggestions = [
    '¿Qué es Katary?',
    '¿Quién es el gerente?',
    '¿Cómo cambio mi foto?',
    '¿Cómo me inscribo a una actividad?',
  ];

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    const text = inputText.trim();
    if (!text) return;

    // Agregar mensaje del usuario
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setShowSuggestions(false);

    // Simular respuesta del bot
    setIsTyping(true);

    setTimeout(() => {
      const lowerText = text.toLowerCase();
      let response = BOT_RESPONSES.default;

      for (const [key, value] of Object.entries(BOT_RESPONSES)) {
        if (lowerText.includes(key)) {
          response = value;
          break;
        }
      }

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: response,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 800 + Math.random() * 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputText(suggestion);
    setTimeout(() => handleSendMessage(), 100);
  };

  return (
    <>
      {/* Burbuja flotante */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110"
        style={{
          background: 'linear-gradient(135deg, #E85A1A, #C03510)',
          boxShadow: '0 8px 32px rgba(232, 90, 26, 0.4)',
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <Bot className="h-7 w-7 text-white" />
        )}
        {/* Indicador de actividad */}
        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#2DB87A] rounded-full border-2 border-white animate-pulse" />
      </motion.button>

      {/* Ventana de chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-32px)] h-[500px] max-h-[70vh] bg-[#1E2245] rounded-2xl shadow-2xl border border-[#2D3163] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div
              className="px-4 py-3 flex items-center justify-between flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #E85A1A, #C03510)',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Katari Bot</h3>
                  <p className="text-white/70 text-[10px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-[#2DB87A] rounded-full inline-block animate-pulse" />
                    Disponible
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-[#0E1733]">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
                      message.sender === 'user'
                        ? 'bg-[#E85A1A] text-white rounded-br-none'
                        : 'bg-[#1E2245] text-[#C7D3F5] rounded-bl-none border border-[#2D3163]'
                    }`}
                  >
                    {message.text}
                    <span className="text-[8px] opacity-50 mt-1 block">
                      {message.timestamp.toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-[#1E2245] text-[#C7D3F5] px-4 py-2 rounded-2xl rounded-bl-none border border-[#2D3163]">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-[#9499BB] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-[#9499BB] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-[#9499BB] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Sugerencias */}
            <AnimatePresence>
              {showSuggestions && messages.length < 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="px-4 py-2 bg-[#111C3D] border-t border-[#2D3163] flex-shrink-0"
                >
                  <div className="flex items-center gap-1 text-[10px] text-[#9499BB] mb-1.5">
                    <Sparkles className="h-3 w-3" />
                    <span>Preguntas sugeridas</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-[10px] px-2 py-1 rounded-full bg-[#1E2245] text-[#C7D3F5] border border-[#2D3163] hover:border-[#E85A1A] hover:text-white transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input */}
            <div className="px-4 py-2 bg-[#111C3D] border-t border-[#2D3163] flex gap-2 flex-shrink-0">
              <input
                ref={inputRef}
                type="text"
                placeholder="Escribe tu pregunta..."
                className="flex-1 px-3 py-2 text-sm bg-[#1E2245] text-white placeholder:text-[#9499BB] rounded-xl border border-[#2D3163] focus:border-[#E85A1A] focus:ring-2 focus:ring-[#E85A1A]/20 outline-none"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className="px-3 py-2 bg-[#E85A1A] text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Send className="h-4 w-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}