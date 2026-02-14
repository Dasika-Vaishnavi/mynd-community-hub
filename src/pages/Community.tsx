import { motion } from "framer-motion";
import { Users, TrendingUp, Plus, Search, Hash } from "lucide-react";
import { MyndPet } from "../components/MyndPet";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const SPACES = [
  { name: "UnwindYourMynd", description: "A general safe space for mental health discussions", members: "12.4k", icon: "🧘", color: "hsl(252, 75%, 60%)" },
  { name: "ADHDWarriors", description: "Tips, memes, and support for the ADHD brain", members: "8.9k", icon: "⚡", color: "hsl(43, 96%, 56%)" },
  { name: "AnxietySupport", description: "You're not alone — share and support each other", members: "15.2k", icon: "💙", color: "hsl(220, 60%, 55%)" },
  { name: "MindfulMoments", description: "Meditation, breathing, and mindfulness practices", members: "6.7k", icon: "🌿", color: "hsl(142, 69%, 50%)" },
  { name: "TherapyTalks", description: "Discuss therapy experiences and find resources", members: "4.3k", icon: "🗣️", color: "hsl(270, 95%, 65%)" },
  { name: "GriefCircle", description: "Holding space for loss and healing", members: "3.1k", icon: "🕊️", color: "hsl(0, 0%, 60%)" },
  { name: "NeurodivergentJoy", description: "Celebrating the beautiful neurodivergent experience", members: "5.8k", icon: "🌈", color: "hsl(329, 86%, 70%)" },
  { name: "SelfCareCorner", description: "Share your routines, tips, and wins", members: "9.6k", icon: "🛁", color: "hsl(200, 70%, 60%)" },
];

const Community = () => {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("space") || "");

  useEffect(() => {
    const space = searchParams.get("space");
    if (space) setSearch(space);
  }, [searchParams]);
  const filtered = SPACES.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 lg:py-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-black text-3xl text-foreground">MyndSpaces</h1>
            <p className="text-muted-foreground text-sm mt-1">Find your people. Join a space.</p>
          </div>
          <button className="flex items-center gap-1.5 gradient-primary text-primary-foreground rounded-xl px-4 py-2.5 font-display font-bold text-sm hover:opacity-90 transition-opacity">
            <Plus size={16} />
            Create
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search spaces..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card rounded-2xl shadow-soft pl-11 pr-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 border border-border"
          />
        </div>

        {/* Space cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((space) => (
            <motion.div
              key={space.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }}
              className="bg-card rounded-2xl shadow-card p-5 group cursor-pointer"
            >
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: `${space.color}15` }}
                >
                  {space.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-foreground group-hover:text-primary transition-colors">
                    m/{space.name}
                  </h3>
                  <p className="text-muted-foreground text-xs mt-0.5 line-clamp-2">{space.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users size={13} />
                  <span>{space.members} members</span>
                </div>
                <button className="text-xs px-4 py-1.5 rounded-xl bg-primary/10 text-primary font-display font-semibold hover:bg-primary/20 transition-colors">
                  Join
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Community;
