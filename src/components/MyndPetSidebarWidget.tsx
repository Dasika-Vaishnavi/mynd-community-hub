import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MyndPetAlive, ExpressionState, ReactionAnimation } from "./MyndPetAlive";
import { getKarmaTier, KARMA_TIERS } from "./MyndPet";
import { Progress } from "./ui/progress";
import { Sparkles, Send, Mic, MicOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

// ─── Hover reactions ──────────────────────────────────────────
const HOVER_REACTIONS = [
  { name: "WIGGLE", expression: "EXCITED" as ExpressionState, bubble: null },
  { name: "BOUNCE_UP", expression: "HAPPY" as ExpressionState, bubble: null },
  { name: "BLUSH", expression: "LOVE" as ExpressionState, bubble: "🥺 hihi..." },
  { name: "SPARKLE", expression: "EXCITED" as ExpressionState, bubble: null },
  { name: "PEEK", expression: "HAPPY" as ExpressionState, bubble: "👀 peek!" },
  { name: "HEART_EYES", expression: "LOVE" as ExpressionState, bubble: null },
  { name: "DIZZY_SPIN", expression: "EXCITED" as ExpressionState, bubble: "✨ yay!" },
];

const CLICK_PHRASES = [
  "Heehee! That tickles! 🌸",
  "Yay!! You clicked Mynd!! 💜",
  "Oh!! Hi hi hi!! ✨",
];

const GREETING_PHRASES = [
  "Yay, you're here! Mynd missed you SO much! 🌟",
  "Heehee, you came back! You're amazing! ✨",
  "Oh wow! Mynd is doing a happy dance right now! 🎉",
];

const CONFETTI_EMOJI = ["🌟", "💜", "✨", "🎉", "💫", "🌸"];

// ─── Confetti burst component ─────────────────────────────────
const ConfettiBurst = ({ active }: { active: boolean }) => {
  if (!active) return null;
  return (
    <AnimatePresence>
      {CONFETTI_EMOJI.map((emoji, i) => {
        const angle = (360 / CONFETTI_EMOJI.length) * i;
        const rad = (angle * Math.PI) / 180;
        return (
          <motion.span
            key={i}
            className="absolute text-sm pointer-events-none z-20"
            style={{ left: "50%", top: "50%" }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(rad) * 50,
              y: Math.sin(rad) * 50,
              opacity: 0,
              scale: 0.4,
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {emoji}
          </motion.span>
        );
      })}
    </AnimatePresence>
  );
};

// ─── Speech bubble ────────────────────────────────────────────
const SpeechBubble = ({
  text,
  visible,
  isTyping,
}: {
  text: string;
  visible: boolean;
  isTyping: boolean;
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const indexRef = useRef(0);

  useEffect(() => {
    if (!visible || !text) {
      setDisplayedText("");
      indexRef.current = 0;
      return;
    }
    if (!isTyping) {
      setDisplayedText(text);
      return;
    }
    indexRef.current = 0;
    setDisplayedText("");
    const interval = setInterval(() => {
      indexRef.current++;
      if (indexRef.current >= text.length) {
        setDisplayedText(text);
        clearInterval(interval);
      } else {
        setDisplayedText(text.slice(0, indexRef.current));
      }
    }, 30);
    return () => clearInterval(interval);
  }, [text, visible, isTyping]);

  return (
    <AnimatePresence>
      {visible && text && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          style={{ transformOrigin: "bottom center" }}
          className="relative mb-2"
        >
          <div
            className="bg-card border border-primary/20 rounded-2xl px-3 py-2 text-xs text-foreground font-display leading-relaxed text-center"
            style={{ boxShadow: "0 4px 20px rgba(167,139,250,0.2)" }}
          >
            {displayedText}
          </div>
          {/* Tail */}
          <div className="flex justify-center -mt-px">
            <div
              className="w-3 h-3 bg-card border-r border-b border-primary/20 rotate-45 -mt-1.5"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── Main widget ──────────────────────────────────────────────

interface MyndPetSidebarWidgetProps {
  karma?: number;
  myndAge?: string;
  username?: string;
  className?: string;
}

export const MyndPetSidebarWidget = ({
  karma = 2340,
  myndAge = "4 months",
  username = "MindfulMango",
  className = "",
}: MyndPetSidebarWidgetProps) => {
  const { user } = useAuth();
  const tier = getKarmaTier(karma);
  const nextTier = KARMA_TIERS.find((t) => t.min > karma);
  const progress = nextTier
    ? ((karma - tier.min) / (nextTier.min - tier.min)) * 100
    : 100;

  // Pet state
  const [petColor, setPetColor] = useState("hsl(329, 86%, 70%)");
  const [accessory, setAccessory] = useState<"none" | "flower_crown" | "star_halo" | "tiny_hat" | "rainbow_aura">("star_halo");
  const [expression, setExpression] = useState<ExpressionState>("HAPPY");
  const [reaction, setReaction] = useState<ReactionAnimation>("NONE");
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Chat state
  const [bubbleText, setBubbleText] = useState("");
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [bubbleTyping, setBubbleTyping] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const bubbleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const greetingPlayedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ── Load pet from DB ────────────────────────────────────────
  useEffect(() => {
    if (!user || !supabase) return;
    const load = async () => {
      const { data } = await supabase
        .from("mynd_pets")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (data) {
        if (data.base_color) setPetColor(data.base_color);
        if (data.accessory) setAccessory(data.accessory as any);
        if (data.expression) setExpression(data.expression as ExpressionState);
      }
    };
    load();
  }, [user]);

  // ── Auto-save with debounce ─────────────────────────────────
  const savePetConfig = useCallback(() => {
    if (!user || !supabase) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      await supabase
        .from("mynd_pets")
        .upsert({
          user_id: user.id,
          base_color: petColor,
          accessory,
          expression,
          updated_at: new Date().toISOString(),
        } as any);
      toast({ title: "✓ Mynd saved!", duration: 2000 });
    }, 1500);
  }, [user, petColor, accessory, expression]);

  useEffect(() => {
    if (user) savePetConfig();
  }, [petColor, accessory]);

  // ── Show speech bubble ──────────────────────────────────────
  const showBubble = useCallback(
    (text: string, duration = 6000, typing = true) => {
      if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);
      setBubbleText(text);
      setBubbleVisible(true);
      setBubbleTyping(typing);
      bubbleTimeoutRef.current = setTimeout(() => {
        setBubbleVisible(false);
      }, duration);
    },
    []
  );

  // ── Play ElevenLabs audio ───────────────────────────────────
  const playVoice = useCallback(
    async (text: string) => {
      if (!supabase) return;
      try {
        setIsSpeaking(true);
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/assistant-speak`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ text, voiceId: "pFZP5JQG7iQjIQuC4Bku" }), // Lily
          }
        );
        if (!response.ok) throw new Error("TTS failed");
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(url);
        };
        audio.onerror = () => setIsSpeaking(false);
        await audio.play();
      } catch {
        setIsSpeaking(false);
      }
    },
    []
  );

  // ── Initial greeting ────────────────────────────────────────
  useEffect(() => {
    if (greetingPlayedRef.current) return;
    greetingPlayedRef.current = true;
    const timeout = setTimeout(() => {
      const greeting =
        GREETING_PHRASES[Math.floor(Math.random() * GREETING_PHRASES.length)];
      setExpression("EXCITED");
      showBubble(greeting, 8000, true);
      playVoice(greeting);
      setTimeout(() => setExpression("HAPPY"), 3000);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [showBubble, playVoice]);

  // ── Hover reaction ──────────────────────────────────────────
  const handleMouseEnter = () => {
    if (isSpeaking || isProcessing) return;
    const r =
      HOVER_REACTIONS[Math.floor(Math.random() * HOVER_REACTIONS.length)];
    setExpression(r.expression);

    // Map hover to reaction animations
    if (r.name === "WIGGLE" || r.name === "DIZZY_SPIN") {
      setReaction("SHAKE_HEAD");
    } else if (r.name === "BOUNCE_UP" || r.name === "PEEK") {
      setReaction("BOUNCE");
    } else if (r.name === "BLUSH" || r.name === "HEART_EYES") {
      setReaction("GROW");
    } else if (r.name === "SPARKLE") {
      setReaction("PARTICLE_BURST");
    }

    if (r.bubble) showBubble(r.bubble, 2000, false);

    setTimeout(() => {
      setReaction("NONE");
    }, 600);
  };

  const handleMouseLeave = () => {
    if (isSpeaking || isProcessing) return;
    setTimeout(() => {
      setExpression("HAPPY");
    }, 800);
  };

  // ── Click reaction ──────────────────────────────────────────
  const handlePetClick = () => {
    if (isSpeaking) return;
    setExpression("CHEERING");
    setReaction("PARTICLE_BURST");
    setConfettiActive(true);

    const phrase =
      CLICK_PHRASES[Math.floor(Math.random() * CLICK_PHRASES.length)];
    showBubble(phrase, 4000, true);
    playVoice(phrase);

    setTimeout(() => {
      setReaction("NONE");
      setConfettiActive(false);
    }, 800);
    setTimeout(() => {
      if (!isSpeaking) setExpression("HAPPY");
    }, 2000);
  };

  // ── Send chat message ───────────────────────────────────────
  const sendMessage = async (text: string) => {
    if (!text.trim() || isProcessing || !supabase) return;
    setChatInput("");
    setIsProcessing(true);
    setExpression("LISTENING");
    setReaction("BOUNCE");
    setTimeout(() => setReaction("NONE"), 400);

    try {
      const { data, error } = await supabase.functions.invoke("mynd-chat", {
        body: {
          userContext: {
            name: username,
            karma,
            tier: tier.name,
            streak: 23,
            sessions: 12,
            badges: [],
            progressToNextTier: Math.round(progress),
            karmaToNextTier: nextTier ? nextTier.min - karma : 0,
            nextTierName: nextTier?.name || "Max",
          },
          prompt: text,
        },
      });
      if (error) throw error;
      const reply = data?.reply || "I'm here for you 💜";
      setExpression("HAPPY");
      showBubble(reply, 10000, true);
      playVoice(reply);
    } catch {
      setExpression("SLEEPY");
      showBubble("I'm having trouble connecting... but I'm here 💜", 4000, false);
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Voice input ─────────────────────────────────────────────
  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: "Speech recognition not supported", variant: "destructive" });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join("");
      setChatInput(transcript);
    };

    recognition.onend = () => {
      setIsRecording(false);
      // Auto-submit if we have text
      if (chatInput.trim()) {
        sendMessage(chatInput);
      }
    };

    recognition.onerror = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  return (
    <div className={`bg-card rounded-2xl shadow-card p-4 text-center ${className}`}>
      {/* Speech bubble */}
      <SpeechBubble text={bubbleText} visible={bubbleVisible} isTyping={bubbleTyping} />

      {/* Pet with hover/click */}
      <div
        className="relative inline-block mx-auto mb-3"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <ConfettiBurst active={confettiActive} />
        <MyndPetAlive
          baseColor={petColor}
          size="md"
          expression={expression}
          isSpeaking={isSpeaking}
          reaction={reaction}
          accessory={accessory}
          level={tier.level}
          onClick={handlePetClick}
        />
      </div>

      {/* Karma + username */}
      <h3 className="font-display font-bold text-sm text-foreground">{username}</h3>
      <p className="text-muted-foreground text-xs mb-2">🐣 {myndAge} old</p>

      {/* Tier badge */}
      <div className="flex items-center justify-center gap-1.5 mb-2">
        <span
          className="text-xs font-mono font-bold px-3 py-1 rounded-full inline-flex items-center gap-1"
          style={{ backgroundColor: `${tier.color}20`, color: tier.color }}
        >
          {tier.emoji} {tier.name}
        </span>
      </div>

      {/* Progress */}
      {nextTier && (
        <div className="space-y-1 mb-3">
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{tier.name}</span>
            <span>{nextTier.name}</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
            <Sparkles size={10} />
            {(nextTier.min - karma).toLocaleString()} karma to next tier
          </p>
        </div>
      )}
      {!nextTier && (
        <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1 mb-3">
          <Sparkles size={10} />
          Max tier reached!
        </p>
      )}

      {/* Chat input bar */}
      <div
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 border transition-all focus-within:shadow-[0_0_0_2px_rgba(167,139,250,0.3)]"
        style={{
          background: "rgba(167,139,250,0.08)",
          borderColor: "rgba(167,139,250,0.25)",
        }}
      >
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage(chatInput);
            }
          }}
          placeholder="Talk to your Mynd..."
          disabled={isProcessing}
          className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none font-display min-w-0"
        />
        {chatInput.trim() && (
          <button
            onClick={() => sendMessage(chatInput)}
            disabled={isProcessing}
            className="p-1 rounded-full text-primary hover:bg-primary/10 transition-colors"
          >
            <Send size={14} />
          </button>
        )}
        <button
          onClick={toggleRecording}
          disabled={isProcessing}
          className={`p-1 rounded-full transition-colors ${
            isRecording
              ? "text-destructive animate-pulse"
              : "text-muted-foreground hover:text-primary hover:bg-primary/10"
          }`}
        >
          {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
        </button>
      </div>
    </div>
  );
};
