import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { MyndPet } from "./MyndPet";

interface TierCelebrationModalProps {
  open: boolean;
  onClose: () => void;
  tierName: string;
  tierEmoji: string;
  tierColor: string;
  tierLevel: number;
  petColor: string;
}

export const TierCelebrationModal = ({
  open,
  onClose,
  tierName,
  tierEmoji,
  tierColor,
  tierLevel,
  petColor,
}: TierCelebrationModalProps) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center px-4"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative bg-card rounded-3xl shadow-elevated p-8 max-w-sm w-full text-center overflow-hidden"
          >
            {/* Glow background */}
            <div
              className="absolute inset-0 opacity-10"
              style={{ background: `radial-gradient(circle at center, ${tierColor}, transparent 70%)` }}
            />

            {/* Particle effects */}
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  backgroundColor: tierColor,
                  left: `${20 + Math.random() * 60}%`,
                  top: `${10 + Math.random() * 30}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0, 0.7, 0],
                  scale: [0.5, 1.2, 0.5],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}

            <div className="relative z-10">
              <button
                onClick={onClose}
                className="absolute -top-2 -right-2 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X size={16} />
              </button>

              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <MyndPet
                  size={120}
                  color={petColor}
                  expression="excited"
                  level={tierLevel}
                  glow
                  className="mx-auto mb-4"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles size={20} style={{ color: tierColor }} />
                  <h2 className="font-display font-black text-xl text-foreground">
                    Your Mynd Has Evolved ✨
                  </h2>
                  <Sparkles size={20} style={{ color: tierColor }} />
                </div>

                <p className="text-muted-foreground text-sm mb-4">
                  You've reached <span className="font-bold" style={{ color: tierColor }}>{tierEmoji} {tierName}</span> tier!
                </p>

                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-2xl gradient-primary text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity shadow-soft"
                >
                  Keep Growing 💜
                </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
