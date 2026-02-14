import { motion } from "framer-motion";
import { PostCard } from "../components/PostCard";
import { MyndPet, getKarmaTier } from "../components/MyndPet";
import { TrendingUp, Flame, Clock, ArrowUp, Sparkles } from "lucide-react";
import { useState } from "react";

const MOCK_POSTS = [
  {
    author: "MindfulMango",
    karma: 2340,
    timeAgo: "2h",
    title: "Small wins matter — I made my bed today 🛏️",
    preview: "I know it sounds trivial but after weeks of barely functioning, making my bed felt like climbing Everest. Don't let anyone tell you small steps don't count.",
    flair: "Celebration",
    space: "UnwindYourMynd",
    upvotes: 847,
    comments: 63,
    petColor: "hsl(329, 86%, 70%)",
    petExpression: "excited" as const,
  },
  {
    author: "QuietStorm_",
    karma: 560,
    timeAgo: "4h",
    title: "Does anyone else feel like they're performing 'being okay'?",
    preview: "At work I'm all smiles but inside I'm running on fumes. I keep hearing 'you seem fine' and it makes me feel even more invisible. Looking for others who relate.",
    flair: "Support Needed",
    space: "AnxietySupport",
    upvotes: 412,
    comments: 89,
    petColor: "hsl(252, 75%, 60%)",
    petExpression: "calm" as const,
  },
  {
    author: "ADHDKnight",
    karma: 8920,
    timeAgo: "6h",
    title: "The body doubling technique changed my productivity forever",
    preview: "I used to spend hours trying to start a task. Then I discovered body doubling — just having someone on a video call while we both work. My focus went from 0 to 100.",
    flair: "Resource",
    space: "ADHDWarriors",
    upvotes: 1203,
    comments: 124,
    petColor: "hsl(142, 69%, 58%)",
    petExpression: "happy" as const,
  },
  {
    author: "LavenderFog",
    karma: 150,
    timeAgo: "8h",
    title: "How do I find a therapist who actually listens?",
    preview: "I've been through 3 therapists and none of them felt right. They kept pushing CBT worksheets without understanding my situation. Any tips on finding the right fit?",
    flair: "Question",
    space: "TherapyTalks",
    upvotes: 234,
    comments: 56,
    petColor: "hsl(270, 95%, 75%)",
    petExpression: "sleepy" as const,
  },
  {
    author: "SunflowerSoul",
    karma: 4100,
    timeAgo: "12h",
    title: "A guided breathing exercise that actually works for panic attacks",
    preview: "4-7-8 breathing: Inhale for 4 counts, hold for 7, exhale for 8. I was skeptical but it genuinely helps me come down from the edge. Sharing because someone might need it today.",
    flair: "Resource",
    space: "MindfulMoments",
    upvotes: 678,
    comments: 42,
    petColor: "hsl(43, 96%, 56%)",
    petExpression: "calm" as const,
  },
];

const SORT_OPTIONS = [
  { key: "hot", label: "Hot", icon: Flame },
  { key: "new", label: "New", icon: Clock },
  { key: "top", label: "Top", icon: ArrowUp },
  { key: "rising", label: "Rising", icon: TrendingUp },
];

const Index = () => {
  const [sort, setSort] = useState("hot");

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 lg:py-8">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-primary rounded-3xl p-6 mb-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-accent/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4" />
        <div className="relative z-10 flex items-center gap-4">
          <MyndPet size={64} color="hsl(329, 86%, 80%)" expression="excited" glow />
          <div>
            <h2 className="font-display font-black text-2xl text-primary-foreground mb-1">
              Welcome to Mynd 💜
            </h2>
            <p className="text-primary-foreground/80 text-sm font-body">
              Your safe space to share, heal, and grow together.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Sort bar */}
      <div className="flex items-center gap-1 mb-5 bg-card rounded-2xl p-1.5 shadow-soft">
        {SORT_OPTIONS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSort(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-display font-semibold transition-all ${
              sort === key
                ? "gradient-primary text-primary-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {MOCK_POSTS.map((post, i) => (
          <PostCard key={i} {...post} />
        ))}
      </div>
    </div>
  );
};

export default Index;
