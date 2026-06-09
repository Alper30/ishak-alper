import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, Bot } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const INITIAL_MESSAGE: Message = {
  role: 'model',
  text: 'Merhaba! Ben İshak Alper\'in danışmanlık asistanıyım. Danışmanlık hizmetleri, süreç veya kitap hakkında merak ettiğiniz her şeyi sorabilirsiniz.',
};

const QUICK_QUESTIONS = [
  'Hangi danışmanlık bana uygun?',
  'Seans nasıl işliyor?',
  'Kitap hakkında bilgi',
];

export default function ConsultBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput('');

    const newMessages: Message[] = [...messages, { role: 'user', text: msg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      setMessages(prev => [
        ...prev,
        { role: 'model', text: data.reply || 'Bir hata oluştu, lütfen tekrar deneyin.' },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'model', text: 'Bağlantı hatası. Lütfen tekrar deneyin.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const showQuickButtons = messages.length === 1;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="fixed bottom-[5.5rem] right-4 sm:right-6 z-50 w-[340px] max-w-[calc(100vw-2rem)] flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/60"
            style={{ height: 480 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-zinc-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-brand-500/15 border border-brand-500/30 flex items-center justify-center shrink-0">
                  <Bot size={15} className="text-brand-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-100 leading-tight">Danışmanlık Asistanı</p>
                  <p className="text-xs text-zinc-500 leading-tight">İshak Alper</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                aria-label="Kapat"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-brand-500 text-zinc-950 font-medium rounded-br-sm'
                        : 'bg-zinc-800/80 text-zinc-200 rounded-bl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {showQuickButtons && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {QUICK_QUESTIONS.map(q => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="text-xs px-3 py-1.5 rounded-full border border-brand-500/30 text-brand-400 hover:bg-brand-500/10 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-800/80 rounded-2xl rounded-bl-sm px-3.5 py-2.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-3 pb-3 pt-2 border-t border-zinc-800 shrink-0">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
                  placeholder="Mesajınızı yazın..."
                  className="flex-1 bg-zinc-800 text-zinc-100 placeholder-zinc-500 text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500/50 min-w-0"
                  disabled={loading}
                />
                <button
                  onClick={() => send()}
                  disabled={!input.trim() || loading}
                  className="shrink-0 p-2.5 rounded-xl bg-brand-500 text-zinc-950 hover:bg-brand-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Gönder"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(v => !v)}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="fixed bottom-5 right-4 sm:right-6 z-50 flex items-center gap-2 rounded-full bg-brand-500 px-5 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-brand-500/30 transition-colors hover:bg-brand-400"
        aria-label={isOpen ? 'Sohbeti kapat' : 'Danışmanlık Al'}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X size={17} />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2"
            >
              <MessageCircle size={17} />
              Danışmanlık Al
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
