import { motion } from "framer-motion";
import { MyndPet, getKarmaTier, KARMA_TIERS } from "../components/MyndPet";
import { Progress } from "../components/ui/progress";
import { Calendar, Clock, Flame, Award, MessageCircle, Heart, BookOpen, Settings, Sparkles } from "lucide-react";
import { useState } from "react";

const USER = {
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
  const tier = getKarmaTier(USER.karma);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 lg:py-8">
      {/* Profile header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-3xl shadow-card p-6 mb-6 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-24 gradient-primary opacity-20" />
        <div className="relative z-10">
          <MyndPet
            size={110}
            color={USER.petColor}
            expression={USER.petExpression}
            glow
            level={tier.level}
            showKarma
            karma={USER.karma}
            className="mx-auto mb-3"
          />
          <h1 className="font-display font-black text-2xl text-foreground mb-1">{USER.name}</h1>
          <p className="text-muted-foreground text-sm mb-1">{USER.pronouns} · Joined {USER.joinDate}</p>
          <p className="text-foreground/80 text-sm mb-3 max-w-md mx-auto">{USER.bio}</p>

          <div className="flex items-center justify-center gap-2 mb-3">
            <span
              className="text-xs font-mono font-bold px-3 py-1 rounded-full inline-flex items-center gap-1"
              style={{ backgroundColor: `${tier.color}20`, color: tier.color }}
            >
              {(tier as any).emoji} {tier.name} · {USER.karma.toLocaleString()} karma
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-muted text-muted-foreground">
              🐣 {USER.myndAge} old
            </span>
          </div>

          {/* Tier progress */}
          {(() => {
            const nextTier = KARMA_TIERS.find((t) => t.min > USER.karma);
            if (!nextTier) return (
              <p className="text-xs text-muted-foreground mb-3 flex items-center justify-center gap-1">
                <Sparkles size={12} /> Max tier reached!
              </p>
            );
            const progress = ((USER.karma - tier.min) / (nextTier.min - tier.min)) * 100;
            return (
              <div className="max-w-xs mx-auto mb-3 space-y-1">
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{tier.name}</span>
                  <span>{nextTier.name}</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-[10px] text-muted-foreground text-center">
                  {(nextTier.min - USER.karma).toLocaleString()} karma to next tier
                </p>
              </div>
            );
          })()}

          <button className="text-xs px-4 py-1.5 rounded-xl bg-muted text-foreground font-display font-semibold hover:bg-muted/80 transition-colors inline-flex items-center gap-1.5">
            <Settings size={13} />
            Edit Profile
          </button>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Heart, label: "Karma", value: USER.karma.toLocaleString(), color: "text-accent" },
          { icon: Flame, label: "Streak", value: `${USER.streak} days`, color: "text-warning" },
          { icon: Calendar, label: "Sessions", value: USER.sessionsAttended.toString(), color: "text-primary" },
          { icon: MessageCircle, label: "Posts", value: USER.posts.toString(), color: "text-secondary" },
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

      <div className="bg-card rounded-2xl shadow-card p-8 text-center">
        <p className="text-muted-foreground text-sm">Your {tab.toLowerCase()} will appear here</p>
      </div>
    </div>
  );
};

export default Profile;
