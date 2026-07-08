import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, X, Calendar, Users, BarChart3, Vote } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PollOption {
  id: string;
  text: string;
  votes: string[]; // user IDs
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  createdBy: string;
  createdAt: string;
  expiresAt: string;
  isMultipleChoice: boolean;
  isActive: boolean;
}

interface PollModuleProps {
  polls?: Poll[];
  onVote?: (pollId: string, optionId: string) => void;
  onCreatePoll?: (poll: Omit<Poll, 'id' | 'createdAt'>) => void;
}

// Datos de ejemplo
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
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    isMultipleChoice: true,
    isActive: true,
  },
];

export function PollModule({ polls = mockPolls, onVote, onCreatePoll }: PollModuleProps) {
  const { user } = useAuthStore();
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [newPoll, setNewPoll] = useState({
    question: '',
    options: ['', ''],
    expiresIn: 7,
    isMultipleChoice: false,
  });

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

  const handleCreatePoll = () => {
    if (!user || !newPoll.question.trim() || newPoll.options.some((o) => !o.trim())) return;

    const poll: Omit<Poll, 'id' | 'createdAt'> = {
      question: newPoll.question.trim(),
      options: newPoll.options.filter((o) => o.trim()).map((text) => ({
        id: `opt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        text: text.trim(),
        votes: [],
      })),
      createdBy: user.id,
      expiresAt: new Date(Date.now() + newPoll.expiresIn * 24 * 60 * 60 * 1000).toISOString(),
      isMultipleChoice: newPoll.isMultipleChoice,
      isActive: true,
    };

    if (onCreatePoll) {
      onCreatePoll(poll);
    } else {
      // Si no hay callback, solo cerramos el modal
      console.log('Encuesta creada:', poll);
    }

    setNewPoll({
      question: '',
      options: ['', ''],
      expiresIn: 7,
      isMultipleChoice: false,
    });
    setShowCreatePoll(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#E85A1A]/20">
            <BarChart3 className="h-4 w-4 text-[#E85A1A]" />
          </div>
          <h3 className="font-syne text-[10px] font-bold tracking-[2.5px] uppercase text-[#E85A1A]">
            Encuestas del equipo
          </h3>
          <span className="text-[10px] font-bold text-[#9499BB]">{polls.length}</span>
        </div>

        <button
          onClick={() => setShowCreatePoll(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#E85A1A] text-white rounded-full hover:bg-[#C03510] transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Crear encuesta
        </button>
      </div>

      {/* Lista de encuestas */}
      <div className="space-y-3">
        {polls.map((poll) => {
          const userHasVoted = hasVoted(poll);
          const userVotes = getUserVotes(poll);
          const totalVotes = getTotalVotes(poll);
          const isExpired = new Date(poll.expiresAt) < new Date();

          return (
            <motion.div
              key={poll.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#2D3163] border border-[#3D4170] rounded-2xl p-4 shadow-lg"
            >
              {/* Header de la encuesta */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-white font-semibold text-sm">{poll.question}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-[#9499BB] flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {totalVotes} voto{totalVotes !== 1 ? 's' : ''}
                    </span>
                    <span className="text-[10px] text-[#9499BB] flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {isExpired ? 'Finalizada' : `Expira ${format(new Date(poll.expiresAt), "d MMM", { locale: es })}`}
                    </span>
                    {poll.isMultipleChoice && (
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-[#3B82F6]/20 text-[#60A5FA]">
                        Múltiple
                      </span>
                    )}
                  </div>
                </div>
                {userHasVoted && !isExpired && (
                  <span className="text-[10px] font-bold text-[#2DB87A] flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Votaste
                  </span>
                )}
              </div>

              {/* Opciones */}
              <div className="space-y-1.5 mt-2">
                {poll.options.map((option) => {
                  const percentage = getVotePercentage(poll, option.id);
                  const isSelected = userVotes.some((v) => v.id === option.id);
                  const isDisabled = (userHasVoted && !poll.isMultipleChoice) || isExpired;

                  return (
                    <button
                      key={option.id}
                      onClick={() => {
                        if (isDisabled) return;
                        if (onVote) {
                          onVote(poll.id, option.id);
                        }
                      }}
                      disabled={isDisabled}
                      className="w-full relative group"
                    >
                      <div className={`relative p-2 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-[#E85A1A] bg-[#E85A1A]/10'
                          : isDisabled
                            ? 'border-[#3D4170] bg-[#1E2245]/50 cursor-not-allowed'
                            : 'border-[#3D4170] bg-[#1E2245] hover:border-[#E85A1A]/50 cursor-pointer'
                      }`}>
                        {/* Barra de progreso */}
                        {userHasVoted && (
                          <div
                            className={`absolute inset-0 rounded-xl transition-all duration-700 ${
                              isSelected
                                ? 'bg-[#E85A1A]/10'
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

              {/* Footer de la encuesta */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#3D4170]">
                <span className="text-[9px] text-[#9499BB]">
                  Creada por {poll.createdBy === user?.id ? 'ti' : 'otro usuario'}
                </span>
                {!userHasVoted && !isExpired && (
                  <span className="text-[9px] text-[#E85A1A] animate-pulse font-semibold">
                    ¡Tu voto cuenta!
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}

        {polls.length === 0 && (
          <div className="bg-[#2D3163] border border-[#3D4170] rounded-2xl p-8 text-center">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-white font-semibold">No hay encuestas activas</p>
            <p className="text-[#9499BB] text-sm">Crea una para tomar decisiones en equipo</p>
          </div>
        )}
      </div>

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
              className="bg-[#1E2245] border border-[#3D4170] rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-lg">Crear encuesta</h3>
                <button
                  onClick={() => setShowCreatePoll(false)}
                  className="text-[#9499BB] hover:text-white transition-colors"
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
                        <input
                          type="text"
                          placeholder={`Opción ${index + 1}`}
                          className="flex-1 px-3 py-2 text-sm bg-[#2D3163] text-white rounded-xl border border-[#3D4170] focus:border-[#E85A1A] focus:ring-2 focus:ring-[#E85A1A]/20 outline-none placeholder:text-[#9499BB]"
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                        />
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
                      Respuesta múltiple
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
                    <Vote className="h-4 w-4" />
                    Crear encuesta
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}