import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useChat, type ChatMessage } from '../../hooks/useChat';

interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatMessageBubble = ({ message }: { message: ChatMessage }) => (
  <div className={`flex ${message.isFromUser ? 'justify-end' : 'justify-start'} mb-3`}>
    <div
      className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${message.isFromUser
        ? 'bg-[#b32839] text-white rounded-br-sm'
        : 'bg-[#f2f4f4] text-[#2a2d2e] rounded-bl-sm'
        }`}
    >
      {!message.isFromUser && (
        <div className="text-[10px] font-bold text-[#b32839] mb-1">{message.senderName}</div>
      )}
      <p className="break-words">{message.text}</p>
      <div className={`text-[9px] mt-1 ${message.isFromUser ? 'text-white/70' : 'text-[#757c7d]'}`}>
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  </div>
);

export const ChatWidget: React.FC<ChatWidgetProps> = ({ isOpen, onClose }) => {
  const { user, profile } = useAuth();
  const { messages, loading, error, sendMessage } = useChat(user?.uid);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    await sendMessage(input, profile?.name || user?.displayName || 'Student');
    setInput('');
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 h-full w-[360px] max-w-full bg-white shadow-2xl z-50 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#adb3b4]/20 bg-[#f9f9f9]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#b32839]">support_agent</span>
              <span className="font-bold text-[#2a2d2e]">Help</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#adb3b4]/10 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined text-xl text-[#757c7d]">close</span>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-6 h-6 border-2 border-[#b32839] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full text-[#757c7d] text-sm">{error}</div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-[#757c7d]">
                <span className="material-symbols-outlined text-4xl mb-2">chat</span>
                <p className="text-sm">Ask a question or request clarification</p>
              </div>
            ) : (
              messages.map((msg) => <ChatMessageBubble key={msg.id} message={msg} />)
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-[#adb3b4]/20 bg-[#f9f9f9]">
            <div className="flex items-center gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                className="flex-1 resize-none px-4 py-2 bg-white border border-[#adb3b4]/30 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-[#b32839]/30 max-h-32"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="p-2 bg-[#b32839] text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#a02230] transition-colors self-center"
              >
                <span className="material-symbols-outlined">{sending ? 'hourglass_empty' : 'send'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatWidget;