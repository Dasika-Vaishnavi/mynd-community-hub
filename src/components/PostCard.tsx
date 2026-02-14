import { motion } from "framer-motion";
import { Heart, MessageCircle, Bookmark, Share2 } from "lucide-react";
import { MyndPet, getKarmaTier } from "./MyndPet";

interface PostCardProps {
  author: string;
  karma: number;
  timeAgo: string;
  title: string;
  preview: string;
  flair: string;
  space: string;
  upvotes: number;
  comments: number;
  petColor?: string;
  petExpression?: "happy" | "calm" | "sleepy" | "excited";
}

const flairColors: Record<string, string> = {
  "Support Needed": "bg-accent/20 text-accent",
  "Resource": "bg-primary/20 text-primary",
  "Story": "bg-secondary/20 text-secondary-foreground",
  "Question": "bg-warning/20 text-warning-foreground",
  "Celebration": "bg-success/20 text-success-foreground",
};

export const PostCard = ({
  author,
  karma,
  timeAgo,
  title,
  preview,
  flair,
  space,
  upvotes,
  comments,
  petColor = "hsl(252, 75%, 60%)",
  petExpression = "happy",
}: PostCardProps) => {
  const tier = getKarmaTier(karma);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl shadow-card p-5 hover:shadow-elevated transition-shadow duration-300"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <MyndPet color={petColor} expression={petExpression} size={36} level={tier.level} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display font-bold text-sm text-foreground">{author}</span>
            <span
              className="text-[10px] font-mono px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: `${tier.color}20`, color: tier.color }}
            >
              {tier.name}
            </span>
            <span className="text-muted-foreground text-xs">· {timeAgo}</span>
          </div>
          <span className="text-muted-foreground text-xs">m/{space}</span>
        </div>
      </div>

      {/* Flair */}
      <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full mb-2 ${flairColors[flair] || "bg-muted text-muted-foreground"}`}>
        {flair}
      </span>

      {/* Content */}
      <h3 className="font-display font-bold text-lg text-foreground mb-1 leading-snug">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4">{preview}</p>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-accent transition-colors px-3 py-1.5 rounded-full hover:bg-accent/10"
        >
          <Heart size={16} />
          <span className="text-sm font-medium">{upvotes}</span>
        </motion.button>
        <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-full hover:bg-primary/10">
          <MessageCircle size={16} />
          <span className="text-sm font-medium">{comments}</span>
        </button>
        <button className="text-muted-foreground hover:text-primary transition-colors p-1.5 rounded-full hover:bg-primary/10 ml-auto">
          <Bookmark size={16} />
        </button>
        <button className="text-muted-foreground hover:text-primary transition-colors p-1.5 rounded-full hover:bg-primary/10">
          <Share2 size={16} />
        </button>
      </div>
    </motion.div>
  );
};
