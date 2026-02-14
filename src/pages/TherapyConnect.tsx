import { motion } from "framer-motion";
import { AITherapistCard } from "../components/AITherapistCard";
import { Star, Calendar, MapPin, Clock, Filter } from "lucide-react";
import { MyndPet } from "../components/MyndPet";

const AI_THERAPISTS = [
  {
    name: "Dr. Ava",
    specialty: "Anxiety & Daily Stress",
    bio: "Warm and empathetic. I help you untangle daily anxiety with compassion and practical tools.",
    tags: ["Anxiety", "Stress", "Mindfulness"],
    imageSrc: "https://images.unsplash.com/photo-1594824476967-48c8b964c7a8?w=200&h=200&fit=crop&crop=face",
    gradient: "linear-gradient(135deg, hsl(252, 75%, 60%), hsl(270, 95%, 75%))",
  },
  {
    name: "Dr. Marcus",
    specialty: "CBT & Structured Thinking",
    bio: "Calm and analytical. Together we'll build frameworks to reframe unhelpful thought patterns.",
    tags: ["CBT", "Depression", "Logic"],
    imageSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    gradient: "linear-gradient(135deg, hsl(220, 60%, 50%), hsl(252, 75%, 60%))",
  },
  {
    name: "Dr. Luna",
    specialty: "Grief, Identity & ADHD",
    bio: "Gentle and creative. I hold space for the messy, beautiful parts of being human.",
    tags: ["Grief", "ADHD", "Identity"],
    imageSrc: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face",
    gradient: "linear-gradient(135deg, hsl(329, 86%, 70%), hsl(270, 95%, 75%))",
  },
];

const REAL_THERAPISTS = [
  {
    name: "Sarah Chen, LMFT",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face",
    specialties: ["Anxiety", "Relationships", "Trauma"],
    cost: 120,
    slots: 5,
    rating: 4.9,
  },
  {
    name: "James Wright, PsyD",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    specialties: ["Depression", "ADHD", "Men's Issues"],
    cost: 95,
    slots: 2,
    rating: 4.8,
  },
  {
    name: "Priya Patel, LPC",
    photo: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&h=200&fit=crop&crop=face",
    specialties: ["PTSD", "Grief", "Cultural Identity"],
    cost: 110,
    slots: 8,
    rating: 4.9,
  },
  {
    name: "David Kim, PhD",
    photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face",
    specialties: ["OCD", "Phobias", "CBT"],
    cost: 140,
    slots: 1,
    rating: 5.0,
  },
];

const TherapyConnect = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 lg:py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
        <h1 className="font-display font-black text-3xl text-foreground mb-2">
          Therapy Connect 🧠
        </h1>
        <p className="text-muted-foreground font-body">
          Chat with AI companions or book sessions with licensed professionals.
        </p>
      </motion.div>

      {/* AI Section */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
            <MyndPet size={20} color="hsl(329, 86%, 80%)" expression="happy" />
          </div>
          <h2 className="font-display font-bold text-xl text-foreground">AI Companions</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-success/20 text-success font-mono">
            Always Available
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {AI_THERAPISTS.map((t) => (
            <AITherapistCard key={t.name} {...t} />
          ))}
        </div>
      </section>

      {/* Real Therapists */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-xl text-foreground">Licensed Therapists</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono">
              {REAL_THERAPISTS.length} available
            </span>
          </div>
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-xl hover:bg-muted">
            <Filter size={14} />
            Filter
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {REAL_THERAPISTS.map((t) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }}
              className="bg-card rounded-2xl shadow-card p-5 flex gap-4"
            >
              <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
                <img src={t.photo} alt={t.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display font-bold text-foreground text-sm truncate">{t.name}</h3>
                  <div className="flex items-center gap-0.5 text-warning">
                    <Star size={12} className="fill-warning" />
                    <span className="text-xs font-mono">{t.rating}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {t.specialties.map((s) => (
                    <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                      {s}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span className="font-mono font-bold text-foreground">${t.cost}/session</span>
                  <span className={`flex items-center gap-1 ${t.slots <= 3 ? "text-accent" : ""}`}>
                    <Clock size={11} />
                    {t.slots} slot{t.slots > 1 ? "s" : ""} left
                  </span>
                </div>
                <div className="flex gap-2">
                  <button className="text-xs px-4 py-1.5 rounded-xl bg-muted text-foreground font-display font-semibold hover:bg-muted/80 transition-colors">
                    View Profile
                  </button>
                  <button className="text-xs px-4 py-1.5 rounded-xl gradient-primary text-primary-foreground font-display font-semibold hover:opacity-90 transition-opacity">
                    Book Session
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default TherapyConnect;
