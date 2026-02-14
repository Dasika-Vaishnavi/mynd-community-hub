import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MyndPet, PET_COLORS, ACCESSORY_OPTIONS, getKarmaTier } from "./MyndPet";
import { Check, Lock, ChevronRight, ChevronLeft, Sparkles, X } from "lucide-react";

interface MyndPetCustomizerProps {
  open: boolean;
  onClose: () => void;
  karma?: number;
  initialColor?: string;
  initialExpression?: "happy" | "calm" | "sleepy" | "excited";
  initialAccessory?: "none" | "crown" | "flower" | "halo" | "sparkle" | "headphones";
  onSave?: (config: {
    color: string;
    expression: "happy" | "calm" | "sleepy" | "excited";
    accessory: "none" | "crown" | "flower" | "halo" | "sparkle" | "headphones";
  }) => void;
}

const EXPRESSIONS: {
  id: "happy" | "calm" | "sleepy" | "excited";
  label: string;
  emoji: string;
}[] = [
  { id: "happy", label: "Happy", emoji: "😊" },
  { id: "calm", label: "Calm", emoji: "😌" },
  { id: "sleepy", label: "Sleepy", emoji: "😴" },
  { id: "excited", label: "Excited", emoji: "🤩" },
];

const STEPS = ["Color", "Expression", "Accessory"];

export const MyndPetCustomizer = ({
  open,
  onClose,
  karma = 0,
  initialColor = "hsl(252, 75%, 60%)",
  initialExpression = "happy",
  initialAccessory = "none",
  onSave,
}: MyndPetCustomizerProps) => {
  const [step, setStep] = useState(0);
  const [color, setColor] = useState(initialColor);
  const [expression, setExpression] = useState(initialExpression);
  const [accessory, setAccessory] = useState(initialAccessory);

  const tier = getKarmaTier(karma);

  const handleSave = () => {
    onSave?.({ color, expression, accessory });
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-card rounded-3xl shadow-elevated w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="gradient-primary p-5 pb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <h2 className="font-display font-black text-xl text-primary-foreground">
                  Customize Your Mynd
                </h2>
                <p className="text-primary-foreground/70 text-xs mt-0.5">
                  Make it uniquely yours ✨
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors text-primary-foreground"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Live preview */}
          <div className="flex justify-center py-6 bg-muted/30">
            <MyndPet
              size={120}
              color={color}
              expression={expression}
              accessory={accessory}
              glow
              level={tier.level}
              className="mx-auto"
            />
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 py-3">
            {STEPS.map((s, i) => (
              <button
                key={s}
                onClick={() => setStep(i)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display font-semibold transition-all ${
                  step === i
                    ? "gradient-primary text-primary-foreground shadow-soft"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-primary-foreground/20 text-[10px] flex items-center justify-center font-bold">
                  {i + 1}
                </span>
                {s}
              </button>
            ))}
          </div>

          {/* Step content */}
          <div className="px-5 pb-2 min-h-[160px]">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="color"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-sm text-muted-foreground mb-3 font-display font-semibold">
                    Pick a color
                  </p>
                  <div className="grid grid-cols-4 gap-3">
                    {PET_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={`relative w-full aspect-square rounded-2xl transition-all hover:scale-105 ${
                          color === c
                            ? "ring-2 ring-primary ring-offset-2 ring-offset-card scale-105"
                            : ""
                        }`}
                        style={{ backgroundColor: c }}
                      >
                        {color === c && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <Check size={20} className="text-primary-foreground drop-shadow-md" />
                          </motion.div>
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="expression"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-sm text-muted-foreground mb-3 font-display font-semibold">
                    Choose an expression
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {EXPRESSIONS.map((e) => (
                      <button
                        key={e.id}
                        onClick={() => setExpression(e.id)}
                        className={`flex items-center gap-3 p-3 rounded-2xl transition-all text-left ${
                          expression === e.id
                            ? "bg-primary/10 ring-2 ring-primary"
                            : "bg-muted hover:bg-muted/80"
                        }`}
                      >
                        <span className="text-2xl">{e.emoji}</span>
                        <div>
                          <p className="font-display font-bold text-sm text-foreground">{e.label}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {e.id === "happy" && "Bright and cheerful"}
                            {e.id === "calm" && "Peaceful and serene"}
                            {e.id === "sleepy" && "Drowsy and cozy"}
                            {e.id === "excited" && "Energetic and thrilled"}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="accessory"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-sm text-muted-foreground mb-3 font-display font-semibold">
                    Add an accessory
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {ACCESSORY_OPTIONS.map((a) => {
                      const locked = tier.level < a.minLevel;
                      return (
                        <button
                          key={a.id}
                          onClick={() => !locked && setAccessory(a.id)}
                          disabled={locked}
                          className={`relative p-3 rounded-2xl transition-all text-center ${
                            locked
                              ? "bg-muted/50 opacity-50 cursor-not-allowed"
                              : accessory === a.id
                              ? "bg-primary/10 ring-2 ring-primary"
                              : "bg-muted hover:bg-muted/80"
                          }`}
                        >
                          {locked && (
                            <Lock
                              size={12}
                              className="absolute top-2 right-2 text-muted-foreground"
                            />
                          )}
                          <p className="font-display font-bold text-xs text-foreground">
                            {a.name}
                          </p>
                          {locked && (
                            <p className="text-[9px] text-muted-foreground mt-0.5">
                              Tier {a.minLevel}+
                            </p>
                          )}
                          {!locked && accessory === a.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="mt-1"
                            >
                              <Check size={14} className="mx-auto text-primary" />
                            </motion.div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer navigation */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-border">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="flex items-center gap-1 text-sm font-display font-semibold text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-3 py-2 rounded-xl hover:bg-muted"
            >
              <ChevronLeft size={16} />
              Back
            </button>

            {step < 2 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-1 text-sm font-display font-bold gradient-primary text-primary-foreground px-5 py-2 rounded-xl shadow-soft hover:opacity-90 transition-opacity"
              >
                Next
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 text-sm font-display font-bold gradient-primary text-primary-foreground px-5 py-2 rounded-xl shadow-soft hover:opacity-90 transition-opacity"
              >
                <Sparkles size={14} />
                Save Mynd
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
