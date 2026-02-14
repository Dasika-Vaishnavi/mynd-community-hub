import { motion } from "framer-motion";

interface MyndPetProps {
  color?: string;
  expression?: "happy" | "calm" | "sleepy" | "excited";
  size?: number;
  className?: string;
  glow?: boolean;
  level?: number;
  accessory?: "none" | "crown" | "flower" | "halo" | "sparkle" | "headphones";
  showKarma?: boolean;
  karma?: number;
}

const expressions = {
  happy: { leftEye: "◠", rightEye: "◠", mouth: "‿" },
  calm: { leftEye: "•", rightEye: "•", mouth: "‿" },
  sleepy: { leftEye: "–", rightEye: "–", mouth: "○" },
  excited: { leftEye: "★", rightEye: "★", mouth: "▽" },
};

const tierColors: Record<number, string> = {
  1: "hsl(142, 69%, 58%)",
  2: "hsl(270, 95%, 75%)",
  3: "hsl(252, 75%, 60%)",
  4: "hsl(329, 86%, 70%)",
  5: "hsl(43, 96%, 56%)",
};

const tierParticleColors: Record<number, string> = {
  1: "#4ADE80",
  2: "#C084FC",
  3: "#6B4DE6",
  4: "#F472B6",
  5: "#FBBF24",
};

// Accessory renderers
const AccessoryCrown = () => (
  <g>
    <polygon points="35,22 38,12 42,19 46,8 50,19 54,8 58,19 62,12 65,22" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1" />
    <circle cx="46" cy="10" r="2" fill="#F472B6" />
    <circle cx="54" cy="10" r="2" fill="#C084FC" />
    <circle cx="50" cy="8" r="2.5" fill="#6B4DE6" />
  </g>
);

const AccessoryFlower = () => (
  <g transform="translate(62, 22) scale(0.8)">
    {[0, 60, 120, 180, 240, 300].map((angle) => (
      <ellipse
        key={angle}
        cx="0"
        cy="-7"
        rx="4"
        ry="7"
        fill="#F472B6"
        opacity="0.8"
        transform={`rotate(${angle})`}
      />
    ))}
    <circle cx="0" cy="0" r="4" fill="#FBBF24" />
  </g>
);

const AccessoryHalo = () => (
  <g>
    <ellipse cx="50" cy="18" rx="20" ry="5" fill="none" stroke="#FBBF24" strokeWidth="2.5" opacity="0.7" />
    <ellipse cx="50" cy="18" rx="20" ry="5" fill="none" stroke="#FDE68A" strokeWidth="1" opacity="0.5" />
  </g>
);

const AccessorySparkle = () => (
  <g>
    {[
      { x: 18, y: 25, s: 0.5 },
      { x: 80, y: 20, s: 0.6 },
      { x: 75, y: 45, s: 0.4 },
      { x: 20, y: 50, s: 0.35 },
      { x: 85, y: 60, s: 0.3 },
    ].map(({ x, y, s }, i) => (
      <g key={i} transform={`translate(${x}, ${y}) scale(${s})`}>
        <polygon points="0,-8 2,-2 8,0 2,2 0,8 -2,2 -8,0 -2,-2" fill="#FBBF24" opacity="0.8">
          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur={`${3 + i}s`} repeatCount="indefinite" />
        </polygon>
      </g>
    ))}
  </g>
);

const AccessoryHeadphones = () => (
  <g>
    <path d="M28,42 Q28,25 50,22 Q72,25 72,42" fill="none" stroke="#1E1B2E" strokeWidth="3" strokeLinecap="round" />
    <rect x="22" y="40" width="8" height="12" rx="4" fill="#1E1B2E" />
    <rect x="70" y="40" width="8" height="12" rx="4" fill="#1E1B2E" />
    <rect x="24" y="42" width="4" height="8" rx="2" fill="#6B4DE6" />
    <rect x="72" y="42" width="4" height="8" rx="2" fill="#6B4DE6" />
  </g>
);

const accessories: Record<string, React.FC> = {
  crown: AccessoryCrown,
  flower: AccessoryFlower,
  halo: AccessoryHalo,
  sparkle: AccessorySparkle,
  headphones: AccessoryHeadphones,
};

// Tier-based particles rendered around the pet
const TierParticles = ({ level, size }: { level: number; size: number }) => {
  if (level < 3) return null;
  const color = tierParticleColors[Math.min(level, 5)] || "#C084FC";
  const count = level >= 5 ? 8 : level >= 4 ? 5 : 3;

  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (360 / count) * i;
        const radius = size * 0.55;
        const x = Math.cos((angle * Math.PI) / 180) * radius;
        const y = Math.sin((angle * Math.PI) / 180) * radius;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: level >= 5 ? 6 : 4,
              height: level >= 5 ? 6 : 4,
              backgroundColor: color,
              left: "50%",
              top: "50%",
              marginLeft: x - 2,
              marginTop: y - 2,
            }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scale: [0.8, 1.3, 0.8],
            }}
            transition={{
              duration: 2 + i * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
          />
        );
      })}
    </>
  );
};

export const MyndPet = ({
  color = "hsl(252, 75%, 60%)",
  expression = "happy",
  size = 80,
  className = "",
  glow = false,
  level = 1,
  accessory = "none",
  showKarma = false,
  karma = 0,
}: MyndPetProps) => {
  const face = expressions[expression];
  const glowColor = tierColors[Math.min(level, 5)] || color;
  const AccessoryComponent = accessory !== "none" ? accessories[accessory] : null;

  // Auto-assign accessory based on tier if none specified
  const effectiveAccessory = accessory !== "none" ? AccessoryComponent : 
    level >= 5 ? accessories.crown :
    level >= 4 ? accessories.halo :
    level >= 3 ? accessories.sparkle :
    null;

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Tier particles */}
      <TierParticles level={level} size={size} />

      {/* Glow layers */}
      {glow && (
        <>
          <div
            className="absolute inset-0 rounded-full blur-xl opacity-30 animate-pulse-soft"
            style={{ backgroundColor: glowColor }}
          />
          {level >= 4 && (
            <div
              className="absolute rounded-full blur-2xl opacity-15 animate-pulse-soft"
              style={{
                backgroundColor: glowColor,
                inset: `-${size * 0.15}px`,
              }}
            />
          )}
        </>
      )}

      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="relative z-10"
      >
        {/* Tier 5 aura ring */}
        {level >= 5 && (
          <circle cx="50" cy="54" r="42" fill="none" stroke="#FBBF24" strokeWidth="1.5" opacity="0.4">
            <animate attributeName="r" values="42;44;42" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0.15;0.4" dur="2s" repeatCount="indefinite" />
          </circle>
        )}

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

        {/* Body inner gradient highlight */}
        <ellipse cx="50" cy="50" rx="30" ry="26" fill="white" opacity="0.06" />

        {/* Highlight */}
        <ellipse cx="38" cy="42" rx="10" ry="7" fill="white" opacity="0.25" />

        {/* Cheeks - more pronounced at higher tiers */}
        <circle cx="32" cy="60" r={level >= 3 ? 7 : 6} fill="hsl(329, 86%, 80%)" opacity={level >= 3 ? 0.5 : 0.4} />
        <circle cx="68" cy="60" r={level >= 3 ? 7 : 6} fill="hsl(329, 86%, 80%)" opacity={level >= 3 ? 0.5 : 0.4} />

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

        {/* Ear highlights */}
        <ellipse cx="24" cy="28" rx="3" ry="5" fill="white" opacity="0.15" transform="rotate(-15 24 28)" />
        <ellipse cx="74" cy="28" rx="3" ry="5" fill="white" opacity="0.15" transform="rotate(15 74 28)" />

        {/* Accessory */}
        {effectiveAccessory && effectiveAccessory({})}
      </svg>

      {/* Karma badge */}
      {showKarma && karma > 0 && (
        <div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full whitespace-nowrap z-20"
          style={{ backgroundColor: `${glowColor}30`, color: glowColor, border: `1px solid ${glowColor}40` }}
        >
          {karma.toLocaleString()} ✦
        </div>
      )}
    </motion.div>
  );
};

export const KARMA_TIERS = [
  { name: "Seedling", min: 0, color: "hsl(142, 69%, 58%)", emoji: "🌱" },
  { name: "Bloom", min: 100, color: "hsl(270, 95%, 75%)", emoji: "🌸" },
  { name: "Radiant", min: 500, color: "hsl(252, 75%, 60%)", emoji: "✨" },
  { name: "Luminous", min: 2000, color: "hsl(329, 86%, 70%)", emoji: "💫" },
  { name: "Transcendent", min: 10000, color: "hsl(43, 96%, 56%)", emoji: "👑" },
];

export const getKarmaTier = (karma: number) => {
  for (let i = KARMA_TIERS.length - 1; i >= 0; i--) {
    if (karma >= KARMA_TIERS[i].min) return { ...KARMA_TIERS[i], level: i + 1 };
  }
  return { ...KARMA_TIERS[0], level: 1 };
};

// Accessory options for customization UI
export const ACCESSORY_OPTIONS = [
  { id: "none" as const, name: "None", minLevel: 1 },
  { id: "flower" as const, name: "Flower", minLevel: 1 },
  { id: "headphones" as const, name: "Headphones", minLevel: 1 },
  { id: "sparkle" as const, name: "Sparkles", minLevel: 3 },
  { id: "halo" as const, name: "Halo", minLevel: 4 },
  { id: "crown" as const, name: "Crown", minLevel: 5 },
];

export const PET_COLORS = [
  "hsl(252, 75%, 60%)",
  "hsl(329, 86%, 70%)",
  "hsl(270, 95%, 75%)",
  "hsl(142, 69%, 58%)",
  "hsl(43, 96%, 56%)",
  "hsl(199, 89%, 48%)",
  "hsl(0, 84%, 60%)",
  "hsl(25, 95%, 53%)",
];
