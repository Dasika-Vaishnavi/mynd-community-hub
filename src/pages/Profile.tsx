import { motion, AnimatePresence } from "framer-motion";
import { MyndPet, getKarmaTier, KARMA_TIERS } from "../components/MyndPet";
import { MyndPetCustomizer } from "../components/MyndPetCustomizer";
import { EditProfileDialog } from "../components/EditProfileDialog";
import { MyndChatPanel } from "../components/MyndChatPanel";
import { TierCelebrationModal } from "../components/TierCelebrationModal";
import { SavedPostsList } from "../components/SavedPostsList";
import { ProfilePostsList } from "../components/ProfilePostsList";
import { ProfileCommentsList } from "../components/ProfileCommentsList";
import { ProfileSessionsList } from "../components/ProfileSessionsList";
import { Progress } from "../components/ui/progress";
import { Calendar, Clock, Flame, Award, MessageCircle, Heart, BookOpen, Settings, Sparkles, Palette } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

const USER_INITIAL = {
  name: "MindfulMango",
  bio: "Healing isn't linear 🌿 | ADHD brain navigating life one day at a time",
  pronouns: "they/them",
  karma: 2340,
  myndAge: "4 months",
  sessionsAttended: 12,
  streak: 23,
  posts: 47,
  comments: 213,
  petColor: "hsl(329, 86%, 70%)",
  petExpression: "happy" as const,
  joinDate: "Oct 2025",
};

const BADGES = [
  { icon: "🌱", name: "First Post", date: "Oct 2025" },
  { icon: "💜", name: "Helped Someone", date: "Nov 2025" },
  { icon: "🔥", name: "7-Day Streak", date: "Nov 2025" },
  { icon: "🧠", name: "Session Pro", date: "Dec 2025" },
  { icon: "⭐", name: "Community Star", date: "Jan 2026" },
  { icon: "🌸", name: "Bloom Tier", date: "Jan 2026" },
];

const ACTIVITY_DATA: number[][] = Array.from({ length: 52 }, () =>
  Array.from({ length: 7 }, () => Math.floor(Math.random() * 5))
);

const activityColor = (level: number) => {
  const colors = [
    "hsl(264, 30%, 93%)",
    "hsl(270, 60%, 85%)",
    "hsl(270, 70%, 75%)",
    "hsl(252, 75%, 60%)",
    "hsl(252, 80%, 45%)",
  ];
  return colors[Math.min(level, 4)];
};

const TABS = ["Posts", "Comments", "Saved", "Sessions"];

const Profile = () => {
  const [tab, setTab] = useState("Posts");
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [celebrationOpen, setCelebrationOpen] = useState(false);

  const [userName, setUserName] = useState(USER_INITIAL.name);
  const [userBio, setUserBio] = useState(USER_INITIAL.bio);
  const [userPronouns, setUserPronouns] = useState(USER_INITIAL.pronouns);
  const [userKarma, setUserKarma] = useState(USER_INITIAL.karma);
  const [petColor, setPetColor] = useState(USER_INITIAL.petColor);
  const [petExpression, setPetExpression] = useState<"happy" | "calm" | "sleepy" | "excited">(USER_INITIAL.petExpression);
  const [petAccessory, setPetAccessory] = useState<"none" | "crown" | "flower" | "halo" | "sparkle" | "headphones">("none");
  const [petIsThinking, setPetIsThinking] = useState(false);

  const tier = getKarmaTier(userKarma);
  const nextTier = KARMA_TIERS.find((t) => t.min > userKarma);
  const progress = nextTier ? ((userKarma - tier.min) / (nextTier.min - tier.min)) * 100 : 100;
  const karmaToNext = nextTier ? nextTier.min - userKarma : 0;

  // Proactive toast on load if streak >= 7
  useEffect(() => {
    if (USER_INITIAL.streak >= 7) {
      const timeout = setTimeout(() => {
        toast({
          title: "🌸 Mynd is proud of your consistency",
          description: `${USER_INITIAL.streak}-day streak! Keep it up 💜`,
          duration: 4000,
        });
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, []);

  // Simulate tier upgrade (hidden dev button)
  const simulateTierUpgrade = () => {
    const currentTierIndex = KARMA_TIERS.findIndex((t) => t.name === tier.name);
    const next = KARMA_TIERS[currentTierIndex + 1];
    if (next) {
      setUserKarma(next.min + 10);
      setTimeout(() => setCelebrationOpen(true), 300);
    }
  };

  const handlePetStateChange = (state: { expression: "happy" | "calm" | "sleepy" | "excited"; isThinking: boolean }) => {
    setPetExpression(state.expression);
    setPetIsThinking(state.isThinking);
  };

  const userContext = {
    name: userName,
    karma: userKarma,
    tier: tier.name,
    streak: USER_INITIAL.streak,
    sessions: USER_INITIAL.sessionsAttended,
    badges: BADGES.map((b) => b.name),
    progressToNextTier: Math.round(progress),
    karmaToNextTier: karmaToNext,
    nextTierName: nextTier?.name || "Max",
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 lg:py-8 pb-24">
      {/* Profile header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-3xl shadow-card p-6 mb-6 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-24 gradient-primary opacity-20" />
        <div className="relative z-10">
          {/* Animated pet wrapper */}
          <motion.div
            animate={petIsThinking ? { scale: [1, 1.03, 1] } : { scale: 1 }}
            transition={petIsThinking ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } : {}}
          >
            <MyndPet
              size={110}
              color={petColor}
              expression={petExpression}
              accessory={petAccessory}
              glow
              level={tier.level}
              showKarma
              karma={userKarma}
              className="mx-auto mb-3"
            />
          </motion.div>

          <h1 className="font-display font-black text-2xl text-foreground mb-1">{userName}</h1>
          <p className="text-muted-foreground text-sm mb-1">{userPronouns} · Joined {USER_INITIAL.joinDate}</p>
          <p className="text-foreground/80 text-sm mb-3 max-w-md mx-auto">{userBio}</p>

          <div className="flex items-center justify-center gap-2 mb-3">
            <span
              className="text-xs font-mono font-bold px-3 py-1 rounded-full inline-flex items-center gap-1"
              style={{ backgroundColor: `${tier.color}20`, color: tier.color }}
            >
              {(tier as any).emoji} {tier.name} · {userKarma.toLocaleString()} karma
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-muted text-muted-foreground">
              🐣 {USER_INITIAL.myndAge} old
            </span>
          </div>

          {/* Tier progress */}
          {nextTier ? (
            <div className="max-w-xs mx-auto mb-3 space-y-1">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>{tier.name}</span>
                <span>{nextTier.name}</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-[10px] text-muted-foreground text-center">
                {karmaToNext.toLocaleString()} karma to next tier
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground mb-3 flex items-center justify-center gap-1">
              <Sparkles size={12} /> Max tier reached!
            </p>
          )}

          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCustomizerOpen(true)}
              className="text-xs px-4 py-1.5 rounded-xl gradient-primary text-primary-foreground font-display font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-1.5 shadow-soft"
            >
              <Palette size={13} />
              Customize Mynd
            </button>
            <button
              onClick={() => setEditProfileOpen(true)}
              className="text-xs px-4 py-1.5 rounded-xl bg-muted text-foreground font-display font-semibold hover:bg-muted/80 transition-colors inline-flex items-center gap-1.5"
            >
              <Settings size={13} />
              Edit Profile
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Heart, label: "Karma", value: userKarma.toLocaleString(), color: "text-accent" },
          { icon: Flame, label: "Streak", value: `${USER_INITIAL.streak} days`, color: "text-warning" },
          { icon: Calendar, label: "Sessions", value: USER_INITIAL.sessionsAttended.toString(), color: "text-primary" },
          { icon: MessageCircle, label: "Posts", value: USER_INITIAL.posts.toString(), color: "text-secondary" },
        ].map(({ icon: Icon, label, value, color }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl shadow-soft p-4 text-center"
          >
            <Icon size={20} className={`mx-auto mb-1.5 ${color}`} />
            <p className="font-display font-black text-lg text-foreground">{value}</p>
            <p className="text-muted-foreground text-xs">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Badges */}
      <div className="bg-card rounded-2xl shadow-card p-5 mb-6">
        <h3 className="font-display font-bold text-sm text-foreground mb-3 flex items-center gap-1.5">
          <Award size={16} className="text-warning" />
          Badges
        </h3>
        <div className="flex flex-wrap gap-2">
          {BADGES.map((b) => (
            <div
              key={b.name}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-sm"
              title={`Earned ${b.date}`}
            >
              <span>{b.icon}</span>
              <span className="font-medium text-foreground text-xs">{b.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Activity heatmap */}
      <div className="bg-card rounded-2xl shadow-card p-5 mb-6">
        <h3 className="font-display font-bold text-sm text-foreground mb-3 flex items-center gap-1.5">
          <BookOpen size={16} className="text-primary" />
          Activity
        </h3>
        <div className="overflow-x-auto">
          <div className="flex gap-[3px]" style={{ minWidth: 700 }}>
            {ACTIVITY_DATA.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((level, di) => (
                  <div
                    key={di}
                    className="w-[11px] h-[11px] rounded-sm"
                    style={{ backgroundColor: activityColor(level) }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground justify-end">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((l) => (
            <div
              key={l}
              className="w-[11px] h-[11px] rounded-sm"
              style={{ backgroundColor: activityColor(l) }}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-card rounded-2xl p-1.5 shadow-soft mb-5">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl text-sm font-display font-semibold transition-all text-center ${
              tab === t
                ? "gradient-primary text-primary-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Posts" && <ProfilePostsList />}
      {tab === "Comments" && <ProfileCommentsList />}
      {tab === "Saved" && <SavedPostsList />}
      {tab === "Sessions" && <ProfileSessionsList />}

      {/* Hidden dev button for tier upgrade demo */}
      <button
        onClick={simulateTierUpgrade}
        className="fixed bottom-4 left-4 z-40 opacity-0 hover:opacity-100 text-[8px] text-muted-foreground bg-muted px-2 py-1 rounded transition-opacity"
      >
        Simulate Tier Upgrade
      </button>

      {/* Floating "Talk to Mynd" button */}
      <motion.button
        onClick={() => setChatOpen(true)}
        whileHover={{ scale: 1.05, boxShadow: "0 0 24px -4px hsl(252, 75%, 60%, 0.4)" }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-40 px-5 py-3 rounded-full font-display font-bold text-sm text-primary-foreground shadow-elevated inline-flex items-center gap-2"
        style={{ background: "hsl(252, 75%, 60%)" }}
      >
        <MessageCircle size={18} />
        💬 Talk to Mynd
      </motion.button>

      {/* Chat Panel */}
      <MyndChatPanel
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        userContext={userContext}
        petColor={petColor}
        petExpression={petExpression}
        tierLevel={tier.level}
        onPetStateChange={handlePetStateChange}
      />

      {/* Tier Celebration Modal */}
      <TierCelebrationModal
        open={celebrationOpen}
        onClose={() => setCelebrationOpen(false)}
        tierName={tier.name}
        tierEmoji={(tier as any).emoji}
        tierColor={tier.color}
        tierLevel={tier.level}
        petColor={petColor}
      />

      {/* Mynd Pet Customizer */}
      <MyndPetCustomizer
        open={customizerOpen}
        onClose={() => setCustomizerOpen(false)}
        karma={userKarma}
        initialColor={petColor}
        initialExpression={petExpression}
        initialAccessory={petAccessory}
        onSave={({ color, expression, accessory }) => {
          setPetColor(color);
          setPetExpression(expression);
          setPetAccessory(accessory);
        }}
      />

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        open={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        initialValues={{ name: userName, bio: userBio, pronouns: userPronouns }}
        onSave={({ name, bio, pronouns }) => {
          setUserName(name);
          setUserBio(bio);
          setUserPronouns(pronouns);
        }}
      />
    </div>
  );
};

export default Profile;
