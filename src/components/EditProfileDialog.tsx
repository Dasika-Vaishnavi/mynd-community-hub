import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save } from "lucide-react";

interface EditProfileDialogProps {
  open: boolean;
  onClose: () => void;
  initialValues: {
    name: string;
    bio: string;
    pronouns: string;
  };
  onSave?: (values: { name: string; bio: string; pronouns: string }) => void;
}

const PRONOUN_OPTIONS = ["he/him", "she/her", "they/them", "he/they", "she/they", "any pronouns", "ask me"];

export const EditProfileDialog = ({
  open,
  onClose,
  initialValues,
  onSave,
}: EditProfileDialogProps) => {
  const [name, setName] = useState(initialValues.name);
  const [bio, setBio] = useState(initialValues.bio);
  const [pronouns, setPronouns] = useState(initialValues.pronouns);

  const handleSave = () => {
    onSave?.({ name, bio, pronouns });
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
          <div className="gradient-primary p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4" />
            <div className="relative z-10 flex items-center justify-between">
              <h2 className="font-display font-black text-xl text-primary-foreground">
                Edit Profile
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors text-primary-foreground"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Display Name */}
            <div>
              <label className="block text-xs font-display font-bold text-foreground mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={30}
                className="w-full px-4 py-2.5 rounded-xl bg-muted text-foreground text-sm font-body border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="Your display name"
              />
              <p className="text-[10px] text-muted-foreground mt-1 text-right">
                {name.length}/30
              </p>
            </div>

            {/* Pronouns */}
            <div>
              <label className="block text-xs font-display font-bold text-foreground mb-1.5">
                Pronouns
              </label>
              <div className="flex flex-wrap gap-2">
                {PRONOUN_OPTIONS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPronouns(p)}
                    className={`px-3 py-1.5 rounded-full text-xs font-display font-semibold transition-all ${
                      pronouns === p
                        ? "gradient-primary text-primary-foreground shadow-soft"
                        : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-display font-bold text-foreground mb-1.5">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={160}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl bg-muted text-foreground text-sm font-body border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                placeholder="Tell the community about yourself..."
              />
              <p className="text-[10px] text-muted-foreground mt-1 text-right">
                {bio.length}/160
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border">
            <button
              onClick={onClose}
              className="text-sm font-display font-semibold text-muted-foreground hover:text-foreground px-4 py-2 rounded-xl hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 text-sm font-display font-bold gradient-primary text-primary-foreground px-5 py-2 rounded-xl shadow-soft hover:opacity-90 transition-opacity"
            >
              <Save size={14} />
              Save Changes
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
