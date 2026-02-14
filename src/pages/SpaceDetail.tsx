import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Hash, Volume2, Megaphone, BookOpen, Users, Shield, Crown,
  ChevronLeft, Settings, Bell, Pin, Send, Plus, Star, Heart,
  MessageCircle, ArrowLeft,
} from "lucide-react";
import { MyndPet, getKarmaTier } from "../components/MyndPet";

// ─── Test data ────────────────────────────────────────────────

interface Channel {
  id: string;
  name: string;
  type: "text" | "voice" | "announcements" | "resources";
  category: string;
  unread?: number;
  pinned?: boolean;
}

interface Mod {
  name: string;
  role: "owner" | "admin" | "moderator";
  karma: number;
  petColor: string;
  petExpression: "happy" | "calm" | "sleepy" | "excited";
  status: "online" | "idle" | "offline";
}

interface SpaceMessage {
  id: string;
  author: string;
  karma: number;
  petColor: string;
  petExpression: "happy" | "calm" | "sleepy" | "excited";
  content: string;
  time: string;
  reactions?: { emoji: string; count: number }[];
}

const SPACES_DATA: Record<
  string,
  {
    name: string;
    description: string;
    icon: string;
    color: string;
    members: string;
    banner: string;
    rules: string[];
    channels: Channel[];
    mods: Mod[];
    messages: Record<string, SpaceMessage[]>;
  }
> = {
  UnwindYourMynd: {
    name: "UnwindYourMynd",
    description: "A general safe space for mental health discussions. No judgement, just support. 💜",
    icon: "🧘",
    color: "hsl(252, 75%, 60%)",
    members: "12.4k",
    banner: "Share your thoughts, support each other, and remember — you're not alone.",
    rules: [
      "Be kind and respectful to everyone",
      "No diagnosing others — share experiences, not medical advice",
      "Use trigger warnings for sensitive topics",
      "No self-promotion or spam",
      "Respect privacy — what's shared here stays here",
    ],
    channels: [
      { id: "welcome", name: "welcome", type: "announcements", category: "INFO", pinned: true },
      { id: "rules", name: "rules-and-guidelines", type: "resources", category: "INFO" },
      { id: "resources", name: "helpful-resources", type: "resources", category: "INFO" },
      { id: "general", name: "general-chat", type: "text", category: "DISCUSSION", unread: 5 },
      { id: "venting", name: "safe-venting", type: "text", category: "DISCUSSION", unread: 2 },
      { id: "wins", name: "daily-wins", type: "text", category: "DISCUSSION", unread: 8 },
      { id: "advice", name: "ask-for-advice", type: "text", category: "DISCUSSION" },
      { id: "cbt", name: "cbt-techniques", type: "text", category: "THERAPY TOOLS" },
      { id: "journal", name: "journal-prompts", type: "text", category: "THERAPY TOOLS" },
      { id: "meditation", name: "meditation-corner", type: "text", category: "THERAPY TOOLS" },
      { id: "voice-chill", name: "chill-lounge", type: "voice", category: "HANGOUT" },
      { id: "voice-study", name: "body-doubling", type: "voice", category: "HANGOUT" },
    ],
    mods: [
      { name: "SereneOwl", role: "owner", karma: 15200, petColor: "hsl(252, 75%, 60%)", petExpression: "calm", status: "online" },
      { name: "HealingHeart", role: "admin", karma: 8900, petColor: "hsl(329, 86%, 70%)", petExpression: "happy", status: "online" },
      { name: "GentleBreeze", role: "moderator", karma: 4300, petColor: "hsl(142, 69%, 58%)", petExpression: "calm", status: "idle" },
      { name: "MindfulMango", role: "moderator", karma: 2340, petColor: "hsl(329, 86%, 70%)", petExpression: "happy", status: "online" },
      { name: "QuietStorm_", role: "moderator", karma: 560, petColor: "hsl(252, 75%, 60%)", petExpression: "sleepy", status: "offline" },
    ],
    messages: {
      "general": [
        { id: "1", author: "HealingHeart", karma: 8900, petColor: "hsl(329, 86%, 70%)", petExpression: "happy", content: "Good morning everyone! 🌸 How's everyone feeling today?", time: "9:12 AM", reactions: [{ emoji: "💜", count: 12 }, { emoji: "🌸", count: 5 }] },
        { id: "2", author: "SunflowerSoul", karma: 4100, petColor: "hsl(43, 96%, 56%)", petExpression: "calm", content: "Had a rough night but I'm here. That counts for something right?", time: "9:24 AM", reactions: [{ emoji: "💪", count: 18 }, { emoji: "💜", count: 9 }] },
        { id: "3", author: "MindfulMango", karma: 2340, petColor: "hsl(329, 86%, 70%)", petExpression: "happy", content: "Absolutely it does. Showing up is half the battle. Proud of you 💜", time: "9:26 AM", reactions: [{ emoji: "❤️", count: 7 }] },
        { id: "4", author: "ADHDKnight", karma: 8920, petColor: "hsl(142, 69%, 58%)", petExpression: "excited", content: "Just finished a 10 min meditation and I feel like a new person honestly. Anyone tried the Mynd breathing exercise?", time: "9:41 AM", reactions: [{ emoji: "🧘", count: 4 }, { emoji: "✨", count: 6 }] },
        { id: "5", author: "LavenderFog", karma: 150, petColor: "hsl(270, 95%, 75%)", petExpression: "sleepy", content: "I've been lurking for a while but wanted to say this space has helped me more than I can express. Thank you all.", time: "10:03 AM", reactions: [{ emoji: "💜", count: 24 }, { emoji: "🥹", count: 15 }, { emoji: "🌸", count: 8 }] },
        { id: "6", author: "SereneOwl", karma: 15200, petColor: "hsl(252, 75%, 60%)", petExpression: "calm", content: "Welcome to the conversation, LavenderFog! We're so glad you're here. This is your space too. 🦉💜", time: "10:07 AM", reactions: [{ emoji: "🎉", count: 11 }] },
      ],
      "wins": [
        { id: "w1", author: "MindfulMango", karma: 2340, petColor: "hsl(329, 86%, 70%)", petExpression: "excited", content: "I actually woke up before my alarm today!!! 🎉", time: "8:30 AM", reactions: [{ emoji: "🎉", count: 22 }, { emoji: "🔥", count: 14 }] },
        { id: "w2", author: "ADHDKnight", karma: 8920, petColor: "hsl(142, 69%, 58%)", petExpression: "happy", content: "Finished a project that I've been procrastinating on for 3 weeks. The dopamine hit is REAL.", time: "9:15 AM", reactions: [{ emoji: "💪", count: 19 }, { emoji: "⭐", count: 8 }] },
        { id: "w3", author: "GentleBreeze", karma: 4300, petColor: "hsl(142, 69%, 58%)", petExpression: "calm", content: "Set a boundary with a family member today. Shaking but I did it. 🌿", time: "11:42 AM", reactions: [{ emoji: "💜", count: 31 }, { emoji: "💪", count: 20 }, { emoji: "🌸", count: 12 }] },
      ],
      "venting": [
        { id: "v1", author: "QuietStorm_", karma: 560, petColor: "hsl(252, 75%, 60%)", petExpression: "sleepy", content: "TW: frustration — I'm so tired of people saying 'just think positive'. That's not how anxiety works. I wish people understood that it's not a choice.", time: "10:30 AM", reactions: [{ emoji: "💜", count: 28 }, { emoji: "🫂", count: 16 }] },
        { id: "v2", author: "HealingHeart", karma: 8900, petColor: "hsl(329, 86%, 70%)", petExpression: "calm", content: "Sending you so much love, QuietStorm. Your feelings are valid and you deserve to be understood. We see you. 💜", time: "10:35 AM", reactions: [{ emoji: "💜", count: 9 }] },
      ],
      "welcome": [
        { id: "a1", author: "SereneOwl", karma: 15200, petColor: "hsl(252, 75%, 60%)", petExpression: "calm", content: "📌 Welcome to m/UnwindYourMynd! This is a safe, judgment-free space for mental health discussions. Please read the rules and introduce yourself in #general-chat. We're glad you're here! 💜", time: "Pinned", reactions: [{ emoji: "💜", count: 342 }] },
      ],
    },
  },
  ADHDWarriors: {
    name: "ADHDWarriors",
    description: "Tips, memes, and support for the ADHD brain. Hyperfocus welcomed. ⚡",
    icon: "⚡",
    color: "hsl(43, 96%, 56%)",
    members: "8.9k",
    banner: "Embrace the chaos. We get it here. 🧠⚡",
    rules: [
      "Be respectful of different ADHD experiences",
      "No gatekeeping — all ADHD journeys are valid",
      "Memes are encouraged but keep them supportive",
      "No unsolicited medication advice",
    ],
    channels: [
      { id: "welcome", name: "welcome", type: "announcements", category: "INFO", pinned: true },
      { id: "general", name: "general-chat", type: "text", category: "DISCUSSION", unread: 12 },
      { id: "memes", name: "adhd-memes", type: "text", category: "DISCUSSION", unread: 24 },
      { id: "tips", name: "productivity-hacks", type: "text", category: "DISCUSSION", unread: 3 },
      { id: "hyperfocus", name: "hyperfocus-corner", type: "text", category: "DISCUSSION" },
      { id: "body-double", name: "body-doubling-sessions", type: "voice", category: "HANGOUT" },
    ],
    mods: [
      { name: "ADHDKnight", role: "owner", karma: 8920, petColor: "hsl(142, 69%, 58%)", petExpression: "excited", status: "online" },
      { name: "SquirrelBrain", role: "admin", karma: 5600, petColor: "hsl(43, 96%, 56%)", petExpression: "excited", status: "online" },
      { name: "FocusPanda", role: "moderator", karma: 3200, petColor: "hsl(199, 89%, 48%)", petExpression: "calm", status: "idle" },
    ],
    messages: {
      "general": [
        { id: "a1", author: "ADHDKnight", karma: 8920, petColor: "hsl(142, 69%, 58%)", petExpression: "excited", content: "Who else started 5 tasks today and finished 0? 🙋‍♂️ Just ADHD things.", time: "8:45 AM", reactions: [{ emoji: "😂", count: 34 }, { emoji: "🙋", count: 22 }] },
        { id: "a2", author: "SquirrelBrain", karma: 5600, petColor: "hsl(43, 96%, 56%)", petExpression: "excited", content: "I organized my entire room at 2am instead of sleeping. Am I productive or destructive? Yes.", time: "9:00 AM", reactions: [{ emoji: "💀", count: 28 }, { emoji: "😂", count: 19 }] },
        { id: "a3", author: "FocusPanda", karma: 3200, petColor: "hsl(199, 89%, 48%)", petExpression: "calm", content: "Hot tip: the Pomodoro technique but with 10 min intervals instead of 25. Game changer for ADHD brains. 🍅", time: "9:20 AM", reactions: [{ emoji: "🧠", count: 15 }, { emoji: "📝", count: 8 }] },
      ],
      "memes": [
        { id: "m1", author: "SquirrelBrain", karma: 5600, petColor: "hsl(43, 96%, 56%)", petExpression: "excited", content: "Me: I'll do it in 5 minutes. Narrator: It was, in fact, 5 hours. 🐿️", time: "10:00 AM", reactions: [{ emoji: "😂", count: 45 }, { emoji: "💀", count: 30 }] },
      ],
      "welcome": [
        { id: "w1", author: "ADHDKnight", karma: 8920, petColor: "hsl(142, 69%, 58%)", petExpression: "excited", content: "📌 Welcome to m/ADHDWarriors! Whether you're diagnosed, suspecting, or just here for the memes — you belong here. ⚡", time: "Pinned", reactions: [{ emoji: "⚡", count: 189 }] },
      ],
    },
  },
  AnxietySupport: {
    name: "AnxietySupport",
    description: "You're not alone — share and support each other through anxiety. 💙",
    icon: "💙",
    color: "hsl(220, 60%, 55%)",
    members: "15.2k",
    banner: "Breathe. You are safe here.",
    rules: [
      "Be gentle with each other",
      "Use trigger warnings when discussing panic attacks",
      "No toxic positivity — validate feelings first",
      "Professional help is encouraged alongside community support",
    ],
    channels: [
      { id: "welcome", name: "welcome", type: "announcements", category: "INFO", pinned: true },
      { id: "general", name: "general-chat", type: "text", category: "DISCUSSION", unread: 7 },
      { id: "grounding", name: "grounding-techniques", type: "text", category: "TOOLS" },
      { id: "panic", name: "panic-support", type: "text", category: "DISCUSSION", unread: 3 },
      { id: "social", name: "social-anxiety", type: "text", category: "DISCUSSION" },
      { id: "calm-room", name: "calm-room", type: "voice", category: "HANGOUT" },
    ],
    mods: [
      { name: "CalmHarbor", role: "owner", karma: 11200, petColor: "hsl(220, 60%, 55%)", petExpression: "calm", status: "online" },
      { name: "BreatheEasy", role: "admin", karma: 6700, petColor: "hsl(200, 70%, 60%)", petExpression: "calm", status: "online" },
    ],
    messages: {
      "general": [
        { id: "x1", author: "CalmHarbor", karma: 11200, petColor: "hsl(220, 60%, 55%)", petExpression: "calm", content: "Reminder: if you're feeling overwhelmed right now, try the 5-4-3-2-1 grounding technique. You've got this. 💙", time: "9:00 AM", reactions: [{ emoji: "💙", count: 42 }, { emoji: "🙏", count: 18 }] },
      ],
      "welcome": [
        { id: "xw1", author: "CalmHarbor", karma: 11200, petColor: "hsl(220, 60%, 55%)", petExpression: "calm", content: "📌 Welcome to m/AnxietySupport. This is a slow, gentle space. Take your time. We're here when you're ready. 💙", time: "Pinned", reactions: [{ emoji: "💙", count: 256 }] },
      ],
    },
  },
};

// Fallback for spaces not fully defined
const DEFAULT_SPACE = {
  name: "",
  description: "A community space on Mynd",
  icon: "🌿",
  color: "hsl(252, 75%, 60%)",
  members: "0",
  banner: "Welcome to this space!",
  rules: ["Be kind", "Be respectful"],
  channels: [
    { id: "welcome", name: "welcome", type: "announcements" as const, category: "INFO", pinned: true },
    { id: "general", name: "general-chat", type: "text" as const, category: "DISCUSSION" },
  ],
  mods: [],
  messages: {
    welcome: [{ id: "d1", author: "Mynd", karma: 0, petColor: "hsl(252, 75%, 60%)", petExpression: "calm" as const, content: "Welcome to this space! Start a conversation.", time: "Now", reactions: [] }],
  },
};

// ─── Icon helper ──────────────────────────────────────────────

const ChannelIcon = ({ type, size = 16 }: { type: string; size?: number }) => {
  switch (type) {
    case "voice": return <Volume2 size={size} />;
    case "announcements": return <Megaphone size={size} />;
    case "resources": return <BookOpen size={size} />;
    default: return <Hash size={size} />;
  }
};

const RoleBadge = ({ role }: { role: string }) => {
  const config: Record<string, { icon: typeof Crown; label: string; className: string }> = {
    owner: { icon: Crown, label: "Owner", className: "text-warning bg-warning/15" },
    admin: { icon: Shield, label: "Admin", className: "text-accent bg-accent/15" },
    moderator: { icon: Star, label: "Mod", className: "text-primary bg-primary/15" },
  };
  const c = config[role] || config.moderator;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${c.className}`}>
      <Icon size={10} />
      {c.label}
    </span>
  );
};

const StatusDot = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    online: "bg-success",
    idle: "bg-warning",
    offline: "bg-muted-foreground/40",
  };
  return <span className={`w-2.5 h-2.5 rounded-full ${colors[status] || colors.offline} ring-2 ring-card`} />;
};

// ─── Component ────────────────────────────────────────────────

const SpaceDetail = () => {
  const { spaceName } = useParams<{ spaceName: string }>();
  const spaceData = SPACES_DATA[spaceName || ""] || { ...DEFAULT_SPACE, name: spaceName || "Unknown" };
  const [activeChannel, setActiveChannel] = useState(spaceData.channels.find((c) => c.type === "text")?.id || spaceData.channels[0]?.id || "general");
  const [messageInput, setMessageInput] = useState("");
  const [showMembers, setShowMembers] = useState(true);

  const activeChannelData = spaceData.channels.find((c) => c.id === activeChannel);
  const channelMessages = spaceData.messages[activeChannel] || [];

  // Group channels by category
  const categories = spaceData.channels.reduce<Record<string, Channel[]>>((acc, ch) => {
    if (!acc[ch.category]) acc[ch.category] = [];
    acc[ch.category].push(ch);
    return acc;
  }, {});

  return (
    <div className="flex h-[calc(100vh-3.5rem)] lg:h-screen overflow-hidden">
      {/* Channel sidebar */}
      <aside className="hidden md:flex w-60 flex-col bg-card border-r border-border flex-shrink-0">
        {/* Space header */}
        <div className="p-4 border-b border-border">
          <Link to="/community" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2">
            <ArrowLeft size={12} />
            Back to spaces
          </Link>
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ backgroundColor: `${spaceData.color}15` }}
            >
              {spaceData.icon}
            </div>
            <div className="min-w-0">
              <h2 className="font-display font-bold text-sm text-foreground truncate">
                m/{spaceData.name}
              </h2>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Users size={10} /> {spaceData.members} members
              </p>
            </div>
          </div>
        </div>

        {/* Channels list */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-3">
          {Object.entries(categories).map(([category, channels]) => (
            <div key={category}>
              <p className="text-[10px] font-display font-bold uppercase tracking-wider text-muted-foreground px-2 mb-1">
                {category}
              </p>
              <div className="space-y-0.5">
                {channels.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChannel(ch.id)}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm transition-colors ${
                      activeChannel === ch.id
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <ChannelIcon type={ch.type} size={14} />
                    <span className="truncate flex-1 text-left">{ch.name}</span>
                    {ch.unread && ch.unread > 0 && (
                      <span className="bg-accent text-accent-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {ch.unread}
                      </span>
                    )}
                    {ch.pinned && <Pin size={10} className="text-muted-foreground" />}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Channel header */}
        <header className="h-12 px-4 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {/* Mobile back */}
            <Link to="/community" className="md:hidden p-1 text-muted-foreground">
              <ArrowLeft size={18} />
            </Link>
            <ChannelIcon type={activeChannelData?.type || "text"} size={16} />
            <span className="font-display font-bold text-sm text-foreground truncate">
              {activeChannelData?.name || "general"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Pin size={16} />
            </button>
            <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Bell size={16} />
            </button>
            <button
              onClick={() => setShowMembers(!showMembers)}
              className={`p-2 rounded-lg transition-colors ${
                showMembers ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Users size={16} />
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Messages area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Mobile channel selector */}
            <div className="md:hidden px-3 py-2 border-b border-border overflow-x-auto">
              <div className="flex gap-1.5">
                {spaceData.channels.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChannel(ch.id)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-display font-semibold whitespace-nowrap transition-all ${
                      activeChannel === ch.id
                        ? "gradient-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <ChannelIcon type={ch.type} size={11} />
                    {ch.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {/* Channel welcome */}
              <div className="text-center py-6">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3"
                  style={{ backgroundColor: `${spaceData.color}15` }}
                >
                  {spaceData.icon}
                </div>
                <h3 className="font-display font-black text-xl text-foreground">
                  Welcome to #{activeChannelData?.name}
                </h3>
                <p className="text-muted-foreground text-sm mt-1 max-w-md mx-auto">
                  {spaceData.banner}
                </p>
              </div>

              {channelMessages.map((msg) => {
                const msgTier = getKarmaTier(msg.karma);
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 group hover:bg-muted/30 -mx-2 px-2 py-1.5 rounded-xl transition-colors"
                  >
                    <MyndPet
                      size={36}
                      color={msg.petColor}
                      expression={msg.petExpression}
                      level={msgTier.level}
                      className="flex-shrink-0 mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display font-bold text-sm text-foreground">
                          {msg.author}
                        </span>
                        <span
                          className="text-[9px] font-mono px-1.5 py-0.5 rounded-full"
                          style={{ backgroundColor: `${msgTier.color}20`, color: msgTier.color }}
                        >
                          {msgTier.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                      </div>
                      <p className="text-sm text-foreground/90 mt-0.5 leading-relaxed">
                        {msg.content}
                      </p>
                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {msg.reactions.map((r, i) => (
                            <button
                              key={i}
                              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted hover:bg-muted/80 text-xs transition-colors"
                            >
                              <span>{r.emoji}</span>
                              <span className="font-medium text-foreground">{r.count}</span>
                            </button>
                          ))}
                          <button className="w-6 h-6 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground transition-colors opacity-0 group-hover:opacity-100">
                            <Plus size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {channelMessages.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">No messages yet. Be the first to say something! ✨</p>
                </div>
              )}
            </div>

            {/* Message input */}
            {activeChannelData?.type !== "voice" && (
              <div className="px-4 pb-4 pt-2 flex-shrink-0">
                <div className="flex items-center gap-2 bg-muted rounded-2xl px-4 py-2.5 border border-border focus-within:ring-2 focus-within:ring-primary/30 transition-all">
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <Plus size={18} />
                  </button>
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder={`Message #${activeChannelData?.name || "general"}`}
                    className="flex-1 bg-transparent text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                  <button
                    className={`p-1.5 rounded-lg transition-colors ${
                      messageInput.trim()
                        ? "text-primary hover:bg-primary/10"
                        : "text-muted-foreground cursor-not-allowed"
                    }`}
                    disabled={!messageInput.trim()}
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Voice channel UI */}
            {activeChannelData?.type === "voice" && (
              <div className="px-4 pb-4 pt-2 flex-shrink-0">
                <button className="w-full py-3 rounded-2xl gradient-primary text-primary-foreground font-display font-bold text-sm shadow-soft hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                  <Volume2 size={18} />
                  Join Voice Channel
                </button>
              </div>
            )}
          </div>

          {/* Members sidebar */}
          <AnimatePresence>
            {showMembers && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 220, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="hidden lg:block border-l border-border bg-card overflow-y-auto flex-shrink-0"
              >
                <div className="p-4">
                  <h3 className="text-[10px] font-display font-bold uppercase tracking-wider text-muted-foreground mb-3">
                    Moderators — {spaceData.mods.length}
                  </h3>
                  <div className="space-y-3">
                    {spaceData.mods.map((mod) => {
                      const modTier = getKarmaTier(mod.karma);
                      return (
                        <div key={mod.name} className="flex items-center gap-2.5">
                          <div className="relative">
                            <MyndPet
                              size={32}
                              color={mod.petColor}
                              expression={mod.petExpression}
                              level={modTier.level}
                            />
                            <div className="absolute -bottom-0.5 -right-0.5">
                              <StatusDot status={mod.status} />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-display font-bold text-xs text-foreground truncate">
                              {mod.name}
                            </p>
                            <RoleBadge role={mod.role} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Rules */}
                  <h3 className="text-[10px] font-display font-bold uppercase tracking-wider text-muted-foreground mt-6 mb-3">
                    Rules
                  </h3>
                  <div className="space-y-2">
                    {spaceData.rules.map((rule, i) => (
                      <div key={i} className="flex gap-2 text-xs text-foreground/80">
                        <span className="font-mono text-primary font-bold">{i + 1}.</span>
                        <span>{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SpaceDetail;
