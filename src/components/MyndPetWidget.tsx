import { motion } from "framer-motion";
import { MyndPet, getKarmaTier, KARMA_TIERS } from "./MyndPet";
import { Progress } from "./ui/progress";
import { Sparkles } from "lucide-react";

interface MyndPetWidgetProps {
  karma?: number;
  petColor?: string;
  petExpression?: "happy" | "calm" | "sleepy" | "excited";
  myndAge?: string;
  username?: string;
  className?: string;
}

export const MyndPetWidget = ({
  karma = 2340,
  petColor = "hsl(329, 86%, 70%)",
  petExpression = "happy",
  myndAge = "4 months",
  username = "MindfulMango",
  className = "",
}: MyndPetWidgetProps) => {
  const tier = getKarmaTier(karma);
  const nextTier = KARMA_TIERS.find((t) => t.min > karma);
  const progress = nextTier
    ? ((karma - tier.min) / (nextTier.min - tier.min)) * 100
    : 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-card rounded-2xl shadow-card p-5 text-center ${className}`}
    >
      <MyndPet
        size={90}
        color={petColor}
        expression={petExpression}
        glow
        level={tier.level}
        showKarma
        karma={karma}
        className="mx-auto mb-4"
      />

      <h3 className="font-display font-bold text-sm text-foreground">{username}</h3>
      <p className="text-muted-foreground text-xs mb-3">🐣 {myndAge} old</p>

      {/* Tier badge */}
      <div className="flex items-center justify-center gap-1.5 mb-3">
        <span
          className="text-xs font-mono font-bold px-3 py-1 rounded-full inline-flex items-center gap-1"
          style={{ backgroundColor: `${tier.color}20`, color: tier.color }}
        >
          {tier.emoji} {tier.name}
        </span>
      </div>

      {/* Progress to next tier */}
      {nextTier && (
        <div className="space-y-1.5">
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
        <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
          <Sparkles size={10} />
          Max tier reached!
        </p>
      )}
    </motion.div>
  );
};
