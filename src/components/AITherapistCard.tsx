import { motion } from "framer-motion";
import { MessageCircle, Mic, Star } from "lucide-react";

interface AITherapistCardProps {
  name: string;
  specialty: string;
  bio: string;
  tags: string[];
  imageSrc: string;
  gradient: string;
  onChat?: () => void;
  onVoice?: () => void;
}

export const AITherapistCard = ({
  name,
  specialty,
  bio,
  tags,
  imageSrc,
  gradient,
  onChat,
  onVoice,
}: AITherapistCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-card rounded-3xl shadow-card overflow-hidden group"
    >
      <div className="h-32 relative" style={{ background: gradient }}>
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
          <div className="w-20 h-20 rounded-full border-4 border-card overflow-hidden shadow-elevated">
            <img src={imageSrc} alt={name} className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      <div className="pt-12 pb-5 px-5 text-center">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <h3 className="font-display font-bold text-lg text-foreground">{name}</h3>
          <Star size={14} className="text-warning fill-warning" />
        </div>
        <p className="text-primary font-medium text-sm mb-2">{specialty}</p>
        <p className="text-muted-foreground text-sm leading-relaxed mb-3">{bio}</p>

        <div className="flex flex-wrap justify-center gap-1.5 mb-4">
          {tags.map((tag) => (
            <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onChat}
            className="flex-1 flex items-center justify-center gap-2 gradient-primary text-primary-foreground rounded-xl py-2.5 font-display font-bold text-sm hover:opacity-90 transition-opacity"
          >
            <MessageCircle size={16} />
            Chat
          </button>
          <button
            onClick={onVoice}
            className="flex-1 flex items-center justify-center gap-2 bg-muted text-foreground rounded-xl py-2.5 font-display font-bold text-sm hover:bg-muted/80 transition-colors"
          >
            <Mic size={16} />
            Voice
          </button>
        </div>
      </div>
    </motion.div>
  );
};
