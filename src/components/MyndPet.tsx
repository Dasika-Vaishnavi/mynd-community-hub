import { motion } from "framer-motion";

interface MyndPetProps {
  color?: string;
  expression?: "happy" | "calm" | "sleepy" | "excited";
  size?: number;
  className?: string;
  glow?: boolean;
  level?: number;
}

const expressions = {
  happy: { leftEye: "◠", rightEye: "◠", mouth: "‿" },
  calm: { leftEye: "•", rightEye: "•", mouth: "‿" },
  sleepy: { leftEye: "–", rightEye: "–", mouth: "○" },
  excited: { leftEye: "★", rightEye: "★", mouth: "▽" },
};

const tierColors: Record<number, string> = {
  1: "hsl(142, 69%, 58%)",   // Seedling - green
  2: "hsl(270, 95%, 75%)",   // Bloom - purple
  3: "hsl(252, 75%, 60%)",   // Radiant - violet
  4: "hsl(329, 86%, 70%)",   // Luminous - pink
  5: "hsl(43, 96%, 56%)",    // Transcendent - gold
};

export const MyndPet = ({
  color = "hsl(252, 75%, 60%)",
  expression = "happy",
  size = 80,
  className = "",
  glow = false,
  level = 1,
}: MyndPetProps) => {
  const face = expressions[expression];
  const glowColor = tierColors[Math.min(level, 5)] || color;

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      {glow && (
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-30 animate-pulse-soft"
          style={{ backgroundColor: glowColor }}
        />
      )}
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="relative z-10"
      >
        {/* Body blob */}
        <motion.ellipse
          cx="50"
          cy="54"
          rx="38"
          ry="34"
          fill={color}
          animate={{
            rx: [38, 36, 38],
            ry: [34, 36, 34],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Highlight */}
        <ellipse cx="38" cy="42" rx="10" ry="7" fill="white" opacity="0.25" />
        {/* Cheeks */}
        <circle cx="32" cy="60" r="6" fill="hsl(329, 86%, 80%)" opacity="0.4" />
        <circle cx="68" cy="60" r="6" fill="hsl(329, 86%, 80%)" opacity="0.4" />
        {/* Eyes */}
        <text x="38" y="55" textAnchor="middle" fontSize="12" fill="white" fontFamily="sans-serif">
          {face.leftEye}
        </text>
        <text x="62" y="55" textAnchor="middle" fontSize="12" fill="white" fontFamily="sans-serif">
          {face.rightEye}
        </text>
        {/* Mouth */}
        <text x="50" y="68" textAnchor="middle" fontSize="10" fill="white" fontFamily="sans-serif">
          {face.mouth}
        </text>
        {/* Ears/horns */}
        <ellipse cx="25" cy="30" rx="8" ry="12" fill={color} opacity="0.8" transform="rotate(-15 25 30)" />
        <ellipse cx="75" cy="30" rx="8" ry="12" fill={color} opacity="0.8" transform="rotate(15 75 30)" />
      </svg>
    </motion.div>
  );
};

export const KARMA_TIERS = [
  { name: "Seedling", min: 0, color: "hsl(142, 69%, 58%)" },
  { name: "Bloom", min: 100, color: "hsl(270, 95%, 75%)" },
  { name: "Radiant", min: 500, color: "hsl(252, 75%, 60%)" },
  { name: "Luminous", min: 2000, color: "hsl(329, 86%, 70%)" },
  { name: "Transcendent", min: 10000, color: "hsl(43, 96%, 56%)" },
];

export const getKarmaTier = (karma: number) => {
  for (let i = KARMA_TIERS.length - 1; i >= 0; i--) {
    if (karma >= KARMA_TIERS[i].min) return { ...KARMA_TIERS[i], level: i + 1 };
  }
  return { ...KARMA_TIERS[0], level: 1 };
};
