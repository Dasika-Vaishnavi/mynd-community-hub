import { useState } from "react";
import { motion } from "framer-motion";
import { MyndPetAlive, ExpressionState, ReactionAnimation } from "../components/MyndPetAlive";
import { Volume2, Sparkles } from "lucide-react";

const EXPRESSIONS: ExpressionState[] = [
  "HAPPY", "EXCITED", "PROUD", "LISTENING",
  "THINKING", "CHEERING", "SLEEPY", "LOVE",
];

const REACTIONS: ReactionAnimation[] = [
  "NONE", "BOUNCE", "SPIN", "SHAKE_HEAD", "GROW", "PARTICLE_BURST",
];

const ACCESSORIES = ["none", "flower_crown", "star_halo", "tiny_hat", "rainbow_aura"] as const;

const COLORS = [
  "hsl(252, 75%, 60%)",
  "hsl(329, 86%, 70%)",
  "hsl(270, 95%, 75%)",
  "hsl(142, 69%, 58%)",
  "hsl(43, 96%, 56%)",
  "hsl(199, 89%, 48%)",
  "hsl(0, 84%, 60%)",
  "hsl(25, 95%, 53%)",
];

const MyndPetDemo = () => {
  const [expression, setExpression] = useState<ExpressionState>("HAPPY");
  const [reaction, setReaction] = useState<ReactionAnimation>("NONE");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [color, setColor] = useState(COLORS[0]);
  const [accessory, setAccessory] = useState<typeof ACCESSORIES[number]>("none");

  const triggerReaction = (r: ReactionAnimation) => {
    setReaction(r);
    setTimeout(() => setReaction("NONE"), 800);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="font-display font-black text-3xl text-foreground mb-2">
        🐾 Living Mynd Pet
      </h1>
      <p className="text-muted-foreground text-sm mb-8">
        8 expressions, idle animations, reactions, and speaking mode
      </p>

      {/* Hero preview */}
      <div className="flex flex-col items-center gap-6 bg-card rounded-3xl shadow-card p-8 mb-8">
        <MyndPetAlive
          baseColor={color}
          size="xl"
          expression={expression}
          isSpeaking={isSpeaking}
          reaction={reaction}
          accessory={accessory}
          level={4}
        />
        <div className="text-center">
          <p className="font-display font-bold text-foreground">{expression}</p>
          <p className="text-xs text-muted-foreground">
            {isSpeaking ? "🔊 Speaking..." : "Idle — breathing, floating, blinking"}
          </p>
        </div>
        <button
          onClick={() => setIsSpeaking(!isSpeaking)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-display font-bold text-sm transition-all ${
            isSpeaking
              ? "bg-accent text-accent-foreground"
              : "gradient-primary text-primary-foreground"
          }`}
        >
          <Volume2 size={16} />
          {isSpeaking ? "Stop Speaking" : "Simulate Speaking"}
        </button>
      </div>

      {/* Expression gallery */}
      <h2 className="font-display font-bold text-lg text-foreground mb-3">Expressions</h2>
      <div className="grid grid-cols-4 gap-4 mb-8">
        {EXPRESSIONS.map((e) => (
          <button
            key={e}
            onClick={() => setExpression(e)}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all ${
              expression === e
                ? "bg-primary/10 ring-2 ring-primary"
                : "bg-card shadow-soft hover:shadow-card"
            }`}
          >
            <MyndPetAlive
              baseColor={color}
              size="sm"
              expression={e}
              accessory="none"
            />
            <span className="text-[10px] font-display font-bold text-foreground">{e}</span>
          </button>
        ))}
      </div>

      {/* Reactions */}
      <h2 className="font-display font-bold text-lg text-foreground mb-3">Reactions</h2>
      <div className="flex flex-wrap gap-2 mb-8">
        {REACTIONS.filter((r) => r !== "NONE").map((r) => (
          <button
            key={r}
            onClick={() => triggerReaction(r)}
            className="px-4 py-2 rounded-2xl bg-card shadow-soft text-xs font-display font-bold text-foreground hover:bg-primary/10 hover:text-primary transition-all"
          >
            {r}
          </button>
        ))}
      </div>

      {/* Colors */}
      <h2 className="font-display font-bold text-lg text-foreground mb-3">Colors</h2>
      <div className="flex gap-3 mb-8">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={`w-10 h-10 rounded-full transition-all hover:scale-110 ${
              color === c ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110" : ""
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      {/* Accessories */}
      <h2 className="font-display font-bold text-lg text-foreground mb-3">Accessories</h2>
      <div className="flex flex-wrap gap-2 mb-8">
        {ACCESSORIES.map((a) => (
          <button
            key={a}
            onClick={() => setAccessory(a)}
            className={`px-4 py-2 rounded-2xl text-xs font-display font-bold transition-all ${
              accessory === a
                ? "gradient-primary text-primary-foreground"
                : "bg-card shadow-soft text-foreground hover:bg-primary/10"
            }`}
          >
            {a === "none" ? "None" : a.replace(/_/g, " ")}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MyndPetDemo;
