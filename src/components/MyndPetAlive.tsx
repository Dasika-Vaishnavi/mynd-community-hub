import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────

export type ExpressionState =
  | "HAPPY"
  | "EXCITED"
  | "PROUD"
  | "LISTENING"
  | "THINKING"
  | "CHEERING"
  | "SLEEPY"
  | "LOVE";

export type ReactionAnimation =
  | "BOUNCE"
  | "SPIN"
  | "SHAKE_HEAD"
  | "GROW"
  | "PARTICLE_BURST"
  | "NONE";

interface MyndPetAliveProps {
  baseColor?: string;
  eyeColor?: string;
  blushColor?: string;
  accessory?: "none" | "flower_crown" | "star_halo" | "tiny_hat" | "rainbow_aura";
  size?: "sm" | "md" | "lg" | "xl";
  expression?: ExpressionState;
  isSpeaking?: boolean;
  reaction?: ReactionAnimation;
  level?: number;
  className?: string;
  onClick?: () => void;
}

// ─── Size map ─────────────────────────────────────────────────

const SIZE_MAP = { sm: 48, md: 80, lg: 120, xl: 180 };

// ─── Expression data ──────────────────────────────────────────

interface ExpressionData {
  leftEye: string;
  rightEye: string;
  mouth: string;
  eyeScale?: number;
  sparkles?: boolean;
  wink?: boolean;
  heartEyes?: boolean;
  zzz?: boolean;
  dots?: boolean;
}

const EXPRESSIONS: Record<ExpressionState, ExpressionData> = {
  HAPPY: {
    leftEye: "M 36 48 Q 40 42 44 48",   // happy crescent
    rightEye: "M 56 48 Q 60 42 64 48",
    mouth: "M 40 62 Q 50 70 60 62",      // big smile
  },
  EXCITED: {
    leftEye: "circle",
    rightEye: "circle",
    mouth: "M 42 60 Q 50 72 58 60 Z",    // open O
    eyeScale: 1.2,
    sparkles: true,
  },
  PROUD: {
    leftEye: "M 36 48 Q 40 42 44 48",
    rightEye: "circle",                    // wink
    mouth: "M 42 62 Q 50 68 58 62",
    wink: true,
  },
  LISTENING: {
    leftEye: "circle",
    rightEye: "circle",
    mouth: "M 43 63 Q 50 66 57 63",       // soft smile
  },
  THINKING: {
    leftEye: "circle",
    rightEye: "circle",
    mouth: "M 45 64 Q 50 62 55 64",       // small pout
    dots: true,
  },
  CHEERING: {
    leftEye: "M 36 48 Q 40 42 44 48",
    rightEye: "M 56 48 Q 60 42 64 48",
    mouth: "M 38 60 Q 50 74 62 60 Z",     // huge open smile
    sparkles: true,
  },
  SLEEPY: {
    leftEye: "M 36 48 L 44 48",           // half-closed line
    rightEye: "M 56 48 L 64 48",
    mouth: "M 46 63 Q 50 65 54 63",       // tiny mouth
    zzz: true,
  },
  LOVE: {
    leftEye: "heart",
    rightEye: "heart",
    mouth: "M 42 62 Q 50 68 58 62",
    heartEyes: true,
  },
};

// ─── Sub-components ───────────────────────────────────────────

const HeartShape = ({ cx, cy, size }: { cx: number; cy: number; size: number }) => (
  <g transform={`translate(${cx}, ${cy}) scale(${size / 14})`}>
    <path
      d="M 0 3 C 0 -1, 5 -3, 5 1 C 5 5, 0 8, 0 8 C 0 8, -5 5, -5 1 C -5 -3, 0 -1, 0 3 Z"
      fill="hsl(329, 86%, 65%)"
    />
  </g>
);

const SparkleParticle = ({ x, y, delay, size }: { x: number; y: number; delay: number; size: number }) => (
  <g transform={`translate(${x}, ${y})`}>
    <polygon
      points="0,-5 1.5,-1.5 5,0 1.5,1.5 0,5 -1.5,1.5 -5,0 -1.5,-1.5"
      fill="#FBBF24"
      opacity="0.8"
      transform={`scale(${size})`}
    >
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="0"
        to="360"
        dur="3s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="opacity"
        values="0.4;1;0.4"
        dur="1.5s"
        begin={`${delay}s`}
        repeatCount="indefinite"
      />
    </polygon>
  </g>
);

const ZzzBubbles = () => (
  <g>
    {[
      { x: 68, y: 30, size: 8, delay: 0 },
      { x: 74, y: 22, size: 10, delay: 0.4 },
      { x: 80, y: 12, size: 12, delay: 0.8 },
    ].map((z, i) => (
      <text
        key={i}
        x={z.x}
        y={z.y}
        fontSize={z.size}
        fill="hsl(252, 75%, 70%)"
        fontFamily="sans-serif"
        fontWeight="bold"
        opacity="0.6"
      >
        <animate
          attributeName="opacity"
          values="0;0.7;0"
          dur="2.5s"
          begin={`${z.delay}s`}
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values={`0,0; 0,-8; 0,-16`}
          dur="2.5s"
          begin={`${z.delay}s`}
          repeatCount="indefinite"
        />
        Z
      </text>
    ))}
  </g>
);

const ThinkingDots = () => (
  <g>
    {[0, 1, 2].map((i) => (
      <circle
        key={i}
        cx={72 + i * 6}
        cy={34}
        r={2.5}
        fill="hsl(252, 75%, 70%)"
        opacity="0.5"
      >
        <animate
          attributeName="opacity"
          values="0.3;0.9;0.3"
          dur="1s"
          begin={`${i * 0.2}s`}
          repeatCount="indefinite"
        />
        <animate
          attributeName="cy"
          values="34;30;34"
          dur="1s"
          begin={`${i * 0.2}s`}
          repeatCount="indefinite"
        />
      </circle>
    ))}
  </g>
);

// ─── Blink hook ───────────────────────────────────────────────

const useRandomBlink = (expression: ExpressionState) => {
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    if (expression === "SLEEPY" || expression === "LOVE") return;
    const scheduleNext = () => {
      const timeout = 3000 + Math.random() * 4000;
      return setTimeout(() => {
        setBlinking(true);
        setTimeout(() => setBlinking(false), 150);
        timerId = scheduleNext();
      }, timeout);
    };
    let timerId = scheduleNext();
    return () => clearTimeout(timerId);
  }, [expression]);

  return blinking;
};

// ─── Accessory renderers ──────────────────────────────────────

const AccessoryFlowerCrown = () => (
  <g>
    {[-14, -7, 0, 7, 14].map((offset, i) => (
      <g key={i} transform={`translate(${50 + offset}, ${22})`}>
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse
            key={a}
            cx="0"
            cy="-3"
            rx="2"
            ry="3.5"
            fill={i % 2 === 0 ? "#F472B6" : "#A78BFA"}
            opacity="0.85"
            transform={`rotate(${a})`}
          />
        ))}
        <circle cx="0" cy="0" r="2" fill="#FBBF24" />
      </g>
    ))}
  </g>
);

const AccessoryStarHalo = () => (
  <g>
    <ellipse cx="50" cy="18" rx="22" ry="5" fill="none" stroke="#FBBF24" strokeWidth="2" opacity="0.6">
      <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite" />
    </ellipse>
    {[30, 42, 58, 70].map((x, i) => (
      <polygon
        key={i}
        points={`${x},14 ${x + 1.5},11 ${x + 3},14 ${x + 1.5},12`}
        fill="#FBBF24"
        opacity="0.7"
      >
        <animate
          attributeName="opacity"
          values="0.4;1;0.4"
          dur={`${1.5 + i * 0.3}s`}
          repeatCount="indefinite"
        />
      </polygon>
    ))}
  </g>
);

const AccessoryTinyHat = () => (
  <g transform="translate(40, 12)">
    <rect x="0" y="8" width="20" height="3" rx="1.5" fill="#1E1B2E" />
    <rect x="4" y="0" width="12" height="10" rx="2" fill="#6B4DE6" />
    <rect x="6" y="5" width="8" height="2" rx="1" fill="#FBBF24" />
  </g>
);

const AccessoryRainbowAura = ({ color }: { color: string }) => (
  <g>
    {[44, 48, 52].map((r, i) => (
      <circle
        key={i}
        cx="50"
        cy="54"
        r={r}
        fill="none"
        stroke={
          i === 0
            ? "hsl(0, 80%, 70%)"
            : i === 1
            ? "hsl(45, 90%, 65%)"
            : "hsl(142, 70%, 60%)"
        }
        strokeWidth="1"
        opacity="0.2"
      >
        <animate
          attributeName="opacity"
          values="0.1;0.3;0.1"
          dur={`${2 + i * 0.5}s`}
          repeatCount="indefinite"
        />
        <animate
          attributeName="r"
          values={`${r};${r + 2};${r}`}
          dur={`${2 + i * 0.5}s`}
          repeatCount="indefinite"
        />
      </circle>
    ))}
  </g>
);

const ACCESSORY_MAP: Record<string, React.FC<{ color: string }>> = {
  flower_crown: () => <AccessoryFlowerCrown />,
  star_halo: () => <AccessoryStarHalo />,
  tiny_hat: () => <AccessoryTinyHat />,
  rainbow_aura: ({ color }) => <AccessoryRainbowAura color={color} />,
};

// ─── Reaction animation variants ─────────────────────────────

const REACTION_VARIANTS: Record<ReactionAnimation, any> = {
  NONE: {},
  BOUNCE: {
    animate: { y: [0, -20, 0] },
    transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] },
  },
  SPIN: {
    animate: { rotate: [0, 360] },
    transition: { duration: 0.6, ease: "easeInOut" },
  },
  SHAKE_HEAD: {
    animate: { rotate: [-10, 10, -10, 10, -10, 0] },
    transition: { duration: 0.6, ease: "easeInOut" },
  },
  GROW: {
    animate: { scale: [1, 1.15, 1] },
    transition: { duration: 0.5, ease: "easeInOut" },
  },
  PARTICLE_BURST: {
    animate: { scale: [1, 1.05, 1] },
    transition: { duration: 0.3 },
  },
};

// ─── Particle burst overlay ──────────────────────────────────

const ParticleBurst = ({ active, color }: { active: boolean; color: string }) => {
  if (!active) return null;
  return (
    <AnimatePresence>
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (360 / 8) * i;
        const rad = (angle * Math.PI) / 180;
        return (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: "50%",
              top: "50%",
              width: 8,
              height: 8,
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(rad) * 40,
              y: Math.sin(rad) * 40,
              opacity: 0,
              scale: 0.3,
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {i % 2 === 0 ? (
              <svg width="8" height="8" viewBox="0 0 10 10">
                <polygon points="5,0 6,4 10,5 6,6 5,10 4,6 0,5 4,4" fill={color} />
              </svg>
            ) : (
              <svg width="8" height="8" viewBox="0 0 10 10">
                <path
                  d="M 5 2 C 5 0, 8 0, 8 2 C 8 4, 5 6, 5 6 C 5 6, 2 4, 2 2 C 2 0, 5 0, 5 2 Z"
                  fill="hsl(329, 86%, 65%)"
                />
              </svg>
            )}
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
};

// ─── Main component ──────────────────────────────────────────

export const MyndPetAlive = ({
  baseColor = "hsl(252, 75%, 60%)",
  eyeColor = "#FFFFFF",
  blushColor = "hsl(329, 86%, 80%)",
  accessory = "none",
  size = "md",
  expression = "HAPPY",
  isSpeaking = false,
  reaction = "NONE",
  level = 1,
  className = "",
  onClick,
}: MyndPetAliveProps) => {
  const px = SIZE_MAP[size];
  const expr = EXPRESSIONS[expression];
  const blinking = useRandomBlink(expression);
  const AccessoryComp = accessory !== "none" ? ACCESSORY_MAP[accessory] : null;

  // Eye rendering
  const renderEye = (side: "left" | "right") => {
    const cx = side === "left" ? 40 : 60;
    const cy = 48;
    const data = side === "left" ? expr.leftEye : expr.rightEye;
    const scale = expr.eyeScale || 1;

    // Blink override
    if (blinking) {
      return (
        <line
          x1={cx - 5}
          y1={cy}
          x2={cx + 5}
          y2={cy}
          stroke={eyeColor}
          strokeWidth="2"
          strokeLinecap="round"
        />
      );
    }

    // Heart eyes
    if (data === "heart") {
      return <HeartShape cx={cx} cy={cy - 1} size={scale * 1.1} />;
    }

    // Circle eyes (with sparkle highlights)
    if (data === "circle") {
      return (
        <g>
          <circle cx={cx} cy={cy} r={5 * scale} fill={eyeColor} />
          <circle cx={cx + 1.5} cy={cy - 1.5} r={1.8} fill={baseColor} opacity="0.4" />
          <circle cx={cx - 1} cy={cy + 1} r={1} fill={baseColor} opacity="0.25" />
        </g>
      );
    }

    // Path-based eyes (crescents, lines)
    return (
      <path
        d={data}
        fill="none"
        stroke={eyeColor}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    );
  };

  // Mouth rendering
  const renderMouth = () => {
    const d = expr.mouth;
    const isClosed = !d.includes("Z");

    if (isSpeaking) {
      // Animated talking mouth
      return (
        <path
          d={d}
          fill={isClosed ? "none" : eyeColor}
          stroke={isClosed ? eyeColor : "none"}
          strokeWidth={isClosed ? "2" : "0"}
          strokeLinecap="round"
        >
          <animate
            attributeName="d"
            values={`${d}; M 42 60 Q 50 72 58 60 Z; ${d}; M 44 61 Q 50 68 56 61 Z; ${d}`}
            dur="0.3s"
            repeatCount="indefinite"
          />
        </path>
      );
    }

    return (
      <path
        d={d}
        fill={isClosed ? "none" : eyeColor}
        stroke={isClosed ? eyeColor : "none"}
        strokeWidth={isClosed ? "2" : "0"}
        strokeLinecap="round"
      />
    );
  };

  const reactionProps =
    reaction !== "NONE" ? REACTION_VARIANTS[reaction] : {};

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center cursor-pointer ${className}`}
      style={{ width: px, height: px }}
      onClick={onClick}
      {...reactionProps}
    >
      {/* Particle burst overlay */}
      <ParticleBurst active={reaction === "PARTICLE_BURST"} color={baseColor} />

      {/* Aura glow */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          backgroundColor: baseColor,
          filter: `blur(${px * 0.25}px)`,
        }}
        animate={{ opacity: [0.12, 0.22, 0.12] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating idle */}
      <motion.div
        animate={{ y: [0, -px * 0.04, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Breathing scale */}
        <motion.div
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg viewBox="0 0 100 100" width={px} height={px}>
            {/* Accessory: rainbow aura behind body */}
            {accessory === "rainbow_aura" && (
              <AccessoryRainbowAura color={baseColor} />
            )}

            {/* Ears */}
            <ellipse
              cx="24"
              cy="32"
              rx="9"
              ry="13"
              fill={baseColor}
              opacity="0.85"
              transform="rotate(-12 24 32)"
            />
            <ellipse
              cx="76"
              cy="32"
              rx="9"
              ry="13"
              fill={baseColor}
              opacity="0.85"
              transform="rotate(12 76 32)"
            />
            {/* Ear inner highlights */}
            <ellipse
              cx="23"
              cy="30"
              rx="4"
              ry="6"
              fill="white"
              opacity="0.12"
              transform="rotate(-12 23 30)"
            />
            <ellipse
              cx="75"
              cy="30"
              rx="4"
              ry="6"
              fill="white"
              opacity="0.12"
              transform="rotate(12 75 30)"
            />

            {/* Body blob — organic shape */}
            <path
              d="M 12 54 C 12 30, 30 18, 50 18 C 70 18, 88 30, 88 54 C 88 78, 70 90, 50 90 C 30 90, 12 78, 12 54 Z"
              fill={baseColor}
            />

            {/* Body inner highlight */}
            <ellipse cx="42" cy="44" rx="14" ry="10" fill="white" opacity="0.18" />
            <ellipse cx="50" cy="52" rx="28" ry="22" fill="white" opacity="0.04" />

            {/* Cheeks */}
            <circle cx="30" cy="60" r="7" fill={blushColor} opacity="0.45">
              <animate
                attributeName="opacity"
                values="0.35;0.55;0.35"
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="70" cy="60" r="7" fill={blushColor} opacity="0.45">
              <animate
                attributeName="opacity"
                values="0.35;0.55;0.35"
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Eyes */}
            {renderEye("left")}
            {renderEye("right")}

            {/* Mouth */}
            {renderMouth()}

            {/* Expression extras */}
            {expr.sparkles && (
              <>
                <SparkleParticle x={18} y={24} delay={0} size={0.5} />
                <SparkleParticle x={82} y={20} delay={0.3} size={0.6} />
                <SparkleParticle x={14} y={50} delay={0.6} size={0.4} />
                <SparkleParticle x={86} y={48} delay={0.9} size={0.45} />
              </>
            )}
            {expr.zzz && <ZzzBubbles />}
            {expr.dots && <ThinkingDots />}

            {/* Accessory overlays */}
            {accessory === "flower_crown" && <AccessoryFlowerCrown />}
            {accessory === "star_halo" && <AccessoryStarHalo />}
            {accessory === "tiny_hat" && <AccessoryTinyHat />}
          </svg>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default MyndPetAlive;
