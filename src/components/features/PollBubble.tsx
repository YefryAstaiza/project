import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, X, Send, Check, Users, Calendar, Plus, Vote, Sparkles, Clock, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

interface PollOption {
  id: string;
  text: string;
  votes: string[];
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  expiresAt: string;
  isMultipleChoice: boolean;
  isActive: boolean;
}

// Datos de ejemplo con más variedad
const mockPolls: Poll[] = [
  {
    id: '1',
    question: '¿Qué día prefieres para la reunión de equipo?',
    options: [
      { id: 'o1', text: 'Lunes', votes: ['u1', 'u2'] },
      { id: 'o2', text: 'Miércoles', votes: ['u3'] },
      { id: 'o3', text: 'Viernes', votes: ['u4', 'u5', 'u6'] },
    ],
    createdBy: 'u1',
    createdByName: 'Carlos Mendoza',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    isMultipleChoice: false,
    isActive: true,
  },
  {
    id: '2',
    question: '¿Qué actividad te gustaría para el próximo team building?',
    options: [
      { id: 'o4', text: 'Paintball', votes: ['u1', 'u5'] },
      { id: 'o5', text: 'Cena', votes: ['u2', 'u3', 'u4'] },
      { id: 'o6', text: 'Escape Room', votes: ['u6'] },
      { id: 'o7', text: 'Karaoke', votes: [] },
    ],
    createdBy: 'u2',
    createdByName: 'María García',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    isMultipleChoice: true,
    isActive: true,
  },
  {
    id: '3',
    question: '¿Dónde celebramos el próximo aniversario?',
    options: [
      { id: 'o8', text: 'Restaurante', votes: ['u1', 'u3', 'u5'] },
      { id: 'o9', text: 'Oficina', votes: ['u2'] },
      { id: 'o10', text: 'Evento virtual', votes: ['u4', 'u6'] },
    ],
    createdBy: 'u3',
    createdByName: 'Admin Sistema',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    isMultipleChoice: false,
    isActive: true,
  },
];

export function PollBubble() {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [polls, setPolls] = useState<Poll[]>(mockPolls);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [newPoll, setNewPoll] = useState({
    question: '',
    options: ['', ''],
    expiresIn: 7,
    isMultipleChoice: false,
  });
  const [votedPolls, setVotedPolls] = useState<Set<string>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const hasVoted = (poll: Poll) => {
    return poll.options.some((opt) => opt.votes.includes(user?.id || ''));
  };

  const getUserVotes = (poll: Poll) => {
    return poll.options.filter((opt) => opt.votes.includes(user?.id || ''));
  };

  const getTotalVotes = (poll: Poll) => {
    return poll.options.reduce((acc, opt) => acc + opt.votes.length, 0);
  };

  const getVotePercentage = (poll: Poll, optionId: string) => {
    const total = getTotalVotes(poll);
    if (total === 0) return 0;
    const option = poll.options.find((o) => o.id === optionId);
    return Math.round((option?.votes.length || 0) / total * 100);
  };

  const getTimeRemaining = (expiresAt: string) => {
    const days = differenceInDays(new Date(expiresAt), new Date());
    if (days < 0) return 'Finalizada';
    if (days === 0) return 'Expira hoy';
    if (days === 1) return 'Expira mañana';
    return `Expira en ${days} días`;
  };

  const handleVote = (pollId: string, optionId: string) => {
    if (!user) return;
    
    setPolls((prev) =>
      prev.map((poll) => {
        if (poll.id !== pollId) return poll;
        
        const userHasVoted = poll.options.some((opt) => opt.votes.includes(user.id));
        
        // Si no es múltiple y ya votó, no hacer nada
        if (userHasVoted && !poll.isMultipleChoice) return poll;
        
        let newOptions = poll.options.map((opt) => ({
          ...opt,
          votes: opt.votes.filter((id) => id !== user.id),
        }));
        
        newOptions = newOptions.map((opt) =>
          opt.id === optionId
            ? { ...opt, votes: [...opt.votes, user.id] }
            : opt
        );
        
        return { ...poll, options: newOptions };
      })
    );
    
    setVotedPolls((prev) => new Set(prev).add(pollId));
    setSuccessMessage('✅ ¡Voto registrado!');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleCreatePoll = () => {
    if (!user || !newPoll.question.trim() || newPoll.options.some((o) => !o.trim())) {
      setSuccessMessage('⚠️ Completa todos los campos');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      return;
    }

    const poll: Poll = {
      id: `poll-${Date.now()}`,
      question: newPoll.question.trim(),
      options: newPoll.options.filter((o) => o.trim()).map((text) => ({
        id: `opt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        text: text.trim(),
        votes: [],
      })),
      createdBy: user.id,
      createdByName: `${user.nombre} ${user.apellido}`,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + newPoll.expiresIn * 24 * 60 * 60 * 1000).toISOString(),
      isMultipleChoice: newPoll.isMultipleChoice,
      isActive: true,
    };

    setPolls((prev) => [poll, ...prev]);
    setNewPoll({
      question: '',
      options: ['', ''],
      expiresIn: 7,
      isMultipleChoice: false,
    });
    setShowCreatePoll(false);
    setSuccessMessage('✅ ¡Encuesta creada con éxito!');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleAddOption = () => {
    setNewPoll((prev) => ({
      ...prev,
      options: [...prev.options, ''],
    }));
  };

  const handleRemoveOption = (index: number) => {
    if (newPoll.options.length <= 2) return;
    setNewPoll((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const handleOptionChange = (index: number, value: string) => {
    setNewPoll((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === index ? value : opt)),
    }));
  };

  const totalActivePolls = polls.filter((p) => p.isActive && new Date(p.expiresAt) > new Date()).length;

  return (
    <>
      {/* Burbuja flotante de encuestas */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-28 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110"
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
          <BarChart3 className="h-7 w-7 text-white" />
        )}
        {totalActivePolls > 0 && !isOpen && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 min-w-[20px] h-[20px] px-1 bg-[#E85A1A] text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-[#1E2245]"
          >
            {totalActivePolls}
          </motion.span>
        )}
      </motion.button>

      {/* Ventana de encuestas */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-40 right-6 z-50 w-[400px] max-w-[calc(100vw-32px)] h-[560px] max-h-[75vh] bg-[#1E2245] rounded-2xl shadow-2xl border border-[#3D4170] overflow-hidden flex flex-col"
          >
            {/* Header - naranja corporativo */}
            <div
              className="px-4 py-3 flex items-center justify-between flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #E85A1A, #C03510)',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Encuestas</h3>
                  <p className="text-white/70 text-[10px]">
                    {totalActivePolls} encuesta{totalActivePolls !== 1 ? 's' : ''} activa{totalActivePolls !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowCreatePoll(true)}
                  className="text-white/70 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
                >
                  <Plus className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/70 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Toast de éxito */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-14 left-4 right-4 z-20 bg-[#2DB87A] text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-lg flex items-center gap-2"
                >
                  <span>{successMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Lista de encuestas */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-[#0E1733] custom-scrollbar">
              {polls.filter((p) => p.isActive && new Date(p.expiresAt) > new Date()).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="text-4xl mb-3 opacity-60">📊</div>
                  <p className="text-white font-semibold text-sm">No hay encuestas activas</p>
                  <p className="text-[#9499BB] text-xs">Crea una para tomar decisiones en equipo</p>
                  <button
                    onClick={() => setShowCreatePoll(true)}
                    className="mt-4 px-4 py-2 bg-[#E85A1A] text-white rounded-full text-xs font-bold hover:bg-[#C03510] transition-colors"
                  >
                    Crear encuesta
                  </button>
                </div>
              ) : (
                polls.filter((p) => p.isActive && new Date(p.expiresAt) > new Date()).map((poll) => {
                  const userHasVoted = hasVoted(poll);
                  const totalVotes = getTotalVotes(poll);
                  const timeRemaining = getTimeRemaining(poll.expiresAt);
                  const isExpiringSoon = differenceInDays(new Date(poll.expiresAt), new Date()) <= 2;

                  return (
                    <motion.div
                      key={poll.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-[#2D3163] rounded-2xl p-4 shadow-lg border border-[#3D4170] hover:border-[#E85A1A]/30 transition-colors"
                    >
                      {/* Encabezado */}
                      <div className="flex items-start justify-between mb-3">
                        <p className="text-white font-semibold text-sm flex-1">
                          {poll.question}
                        </p>
                        <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                          {poll.isMultipleChoice && (
                            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-[#E85A1A]/20 text-[#E85A1A] border border-[#E85A1A]/30">
                              Múltiple
                            </span>
                          )}
                          {isExpiringSoon && !userHasVoted && (
                            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-[#E85A1A]/20 text-[#E85A1A] animate-pulse">
                              ¡Último día!
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Opciones */}
                      <div className="space-y-1.5">
                        {poll.options.map((option) => {
                          const percentage = getVotePercentage(poll, option.id);
                          const isSelected = getUserVotes(poll).some((v) => v.id === option.id);
                          const isDisabled = (userHasVoted && !poll.isMultipleChoice);

                          return (
                            <button
                              key={option.id}
                              onClick={() => {
                                if (isDisabled) return;
                                handleVote(poll.id, option.id);
                              }}
                              disabled={isDisabled}
                              className="w-full relative group"
                            >
                              <div className={`relative p-3 rounded-xl border transition-all ${
                                isSelected
                                  ? 'border-[#E85A1A] bg-[#E85A1A]/10'
                                  : isDisabled
                                    ? 'border-[#3D4170] bg-[#1E2245]/50 cursor-not-allowed opacity-70'
                                    : 'border-[#3D4170] bg-[#1E2245] hover:border-[#E85A1A]/50 cursor-pointer hover:bg-[#E85A1A]/5'
                              }`}>
                                {/* Barra de progreso */}
                                {userHasVoted && (
                                  <div
                                    className={`absolute inset-0 rounded-xl transition-all duration-700 ${
                                      isSelected
                                        ? 'bg-[#E85A1A]/15'
                                        : 'bg-[#1E2245]/30'
                                    }`}
                                    style={{ width: `${percentage}%` }}
                                  />
                                )}

                                <div className="relative z-10 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    {userHasVoted && isSelected && (
                                      <Check className="h-3.5 w-3.5 text-[#E85A1A]" />
                                    )}
                                    <span className={`text-sm ${isSelected ? 'text-white font-medium' : 'text-[#C7D3F5]'}`}>
                                      {option.text}
                                    </span>
                                  </div>
                                  {userHasVoted && (
                                    <span className={`text-xs font-bold ${isSelected ? 'text-[#E85A1A]' : 'text-[#9499BB]'}`}>
                                      {percentage}%
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#3D4170]">
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] text-[#9499BB] flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {totalVotes}
                          </span>
                          <span className="text-[9px] text-[#9499BB] flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {timeRemaining}
                          </span>
                        </div>
                        {userHasVoted ? (
                          <span className="text-[9px] text-[#2DB87A] font-semibold flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            Votaste
                          </span>
                        ) : (
                          <span className="text-[9px] text-[#E85A1A] font-semibold animate-pulse">
                            ¡Tu voto cuenta!
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal para crear encuesta */}
      <AnimatePresence>
        {showCreatePoll && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/70 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowCreatePoll(false);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#1E2245] border border-[#3D4170] rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl custom-scrollbar"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <Vote className="h-5 w-5 text-[#E85A1A]" />
                  Crear encuesta
                </h3>
                <button
                  onClick={() => setShowCreatePoll(false)}
                  className="text-[#9499BB] hover:text-white transition-colors p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Pregunta */}
                <div>
                  <label className="text-xs font-bold text-[#9499BB] uppercase tracking-wider block mb-1">
                    Pregunta
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: ¿Qué día prefieres para la reunión?"
                    className="w-full px-3 py-2 text-sm bg-[#2D3163] text-white rounded-xl border border-[#3D4170] focus:border-[#E85A1A] focus:ring-2 focus:ring-[#E85A1A]/20 outline-none placeholder:text-[#9499BB]"
                    value={newPoll.question}
                    onChange={(e) => setNewPoll((prev) => ({ ...prev, question: e.target.value }))}
                  />
                </div>

                {/* Opciones */}
                <div>
                  <label className="text-xs font-bold text-[#9499BB] uppercase tracking-wider block mb-1">
                    Opciones
                  </label>
                  <div className="space-y-2">
                    {newPoll.options.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <div className="flex-1 relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9499BB] text-xs font-bold">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          <input
                            type="text"
                            placeholder={`Opción ${index + 1}`}
                            className="w-full pl-8 pr-3 py-2 text-sm bg-[#2D3163] text-white rounded-xl border border-[#3D4170] focus:border-[#E85A1A] focus:ring-2 focus:ring-[#E85A1A]/20 outline-none placeholder:text-[#9499BB]"
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                          />
                        </div>
                        {newPoll.options.length > 2 && (
                          <button
                            onClick={() => handleRemoveOption(index)}
                            className="px-2 py-2 text-[#9499BB] hover:text-red-400 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleAddOption}
                    className="mt-2 text-xs text-[#E85A1A] hover:text-[#C03510] transition-colors flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Agregar opción
                  </button>
                </div>

                {/* Configuración */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#9499BB] uppercase tracking-wider block mb-1">
                      Expira en (días)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      className="w-full px-3 py-2 text-sm bg-[#2D3163] text-white rounded-xl border border-[#3D4170] focus:border-[#E85A1A] focus:ring-2 focus:ring-[#E85A1A]/20 outline-none"
                      value={newPoll.expiresIn}
                      onChange={(e) => setNewPoll((prev) => ({ ...prev, expiresIn: parseInt(e.target.value) || 7 }))}
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newPoll.isMultipleChoice}
                        onChange={(e) => setNewPoll((prev) => ({ ...prev, isMultipleChoice: e.target.checked }))}
                        className="w-4 h-4 accent-[#E85A1A]"
                      />
                      <span className="text-xs">Múltiple</span>
                    </label>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowCreatePoll(false)}
                    className="flex-1 px-4 py-2 text-sm font-bold text-[#9499BB] bg-[#2D3163] rounded-xl hover:bg-[#3D4170] transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreatePoll}
                    className="flex-1 px-4 py-2 text-sm font-bold text-white bg-[#E85A1A] rounded-xl hover:bg-[#C03510] transition-colors flex items-center justify-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Publicar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}