import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, Sparkles } from "lucide-react";
import { MyndPet } from "./MyndPet";
import { supabase } from "@/integrations/supabase/client";

interface UserContext {
  name: string;
  karma: number;
  tier: string;
  streak: number;
  sessions: number;
  badges: string[];
  progressToNextTier: number;
  karmaToNextTier: number;
  nextTierName: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface MyndChatPanelProps {
  open: boolean;
  onClose: () => void;
  userContext: UserContext;
  petColor: string;
  petExpression: "happy" | "calm" | "sleepy" | "excited";
  tierLevel: number;
  onPetStateChange?: (state: { expression: "happy" | "calm" | "sleepy" | "excited"; isThinking: boolean }) => void;
}

const PRESETS = [
  { label: "How am I doing?", prompt: "How am I doing overall? Give me an honest, supportive assessment of my progress." },
  { label: "What should I focus on?", prompt: "Based on my stats and progress, what should I focus on next to keep growing?" },
  { label: "Motivate me", prompt: "I need some motivation. Remind me of how far I've come and encourage me to keep going." },
];

export const MyndChatPanel = ({
  open,
  onClose,
  userContext,
  petColor,
  petExpression,
  tierLevel,
  onPetStateChange,
}: MyndChatPanelProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [disabledPreset, setDisabledPreset] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (prompt: string, label?: string) => {
    if (isLoading) return;
    setIsLoading(true);
    if (label) setDisabledPreset(label);
    onPetStateChange?.({ expression: "calm", isThinking: true });

    setMessages((prev) => [...prev, { role: "user", content: label || prompt }]);

    try {
      const { data, error } = await supabase.functions.invoke("mynd-chat", {
        body: { userContext, prompt },
      });

      if (error) throw error;

      const reply = data?.reply || "I'm here for you 💜";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      onPetStateChange?.({ expression: "happy", isThinking: false });
    } catch (e) {
      console.error("Chat error:", e);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I'm having trouble connecting right now. But I'm still here for you 💜" },
      ]);
      onPetStateChange?.({ expression: "sleepy", isThinking: false });
    } finally {
      setIsLoading(false);
      setDisabledPreset(null);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="fixed inset-x-0 bottom-0 z-50 max-w-lg mx-auto"
        >
          <div className="bg-card rounded-t-3xl shadow-elevated border border-border border-b-0 flex flex-col" style={{ maxHeight: "75vh" }}>
            {/* Header */}
            <div className="flex items-center gap-3 px-5 pt-5 pb-3 border-b border-border">
              <MyndPet size={36} color={petColor} expression={petExpression} level={tierLevel} />
              <div className="flex-1">
                <h3 className="font-display font-bold text-sm text-foreground">Chat with Your Mynd</h3>
                <p className="text-[10px] text-muted-foreground">Your personal growth companion</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3" style={{ minHeight: 200 }}>
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <Sparkles size={24} className="mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground font-display">
                    Hi {userContext.name}! Tap a button below to chat with me 💜
                  </p>
                </div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "gradient-primary text-primary-foreground rounded-br-lg"
                        : "bg-muted text-foreground rounded-bl-lg"
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-muted rounded-2xl rounded-bl-lg px-4 py-3 flex items-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-primary/50"
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Preset buttons */}
            <div className="px-5 pb-5 pt-2 flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => sendMessage(p.prompt, p.label)}
                  disabled={isLoading || disabledPreset === p.label}
                  className="px-4 py-2 rounded-2xl text-xs font-display font-bold border border-border bg-card text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
