import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Bookmark, Share2, MoreHorizontal, Pencil, Check, X, Trash2 } from "lucide-react";
import { MyndPet, getKarmaTier } from "./MyndPet";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  author: string;
  content: string;
  timeAgo: string;
  karma: number;
  petColor: string;
  petExpression: "happy" | "calm" | "sleepy" | "excited";
}

interface PostCardProps {
  id?: string;
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
  editable?: boolean;
  initialSaved?: boolean;
  onEdit?: (title: string, preview: string) => void;
  onSaveToggle?: (postId: string, saved: boolean) => void;
}

const flairColors: Record<string, string> = {
  "Support Needed": "bg-accent/20 text-accent",
  "Resource": "bg-primary/20 text-primary",
  "Story": "bg-secondary/20 text-secondary-foreground",
  "Question": "bg-warning/20 text-warning-foreground",
  "Celebration": "bg-success/20 text-success-foreground",
};

const MOCK_COMMENTS: Comment[] = [
  { id: "c1", author: "SunflowerSoul", content: "This is so relatable. Thank you for sharing 💜", timeAgo: "1h", karma: 4100, petColor: "hsl(43, 96%, 56%)", petExpression: "calm" },
  { id: "c2", author: "GentleBreeze", content: "You're doing amazing, one step at a time!", timeAgo: "45m", karma: 4300, petColor: "hsl(142, 69%, 58%)", petExpression: "happy" },
];

export const PostCard = ({
  id,
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
  editable = true,
  initialSaved = false,
  onEdit,
  onSaveToggle,
}: PostCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const tier = getKarmaTier(karma);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(upvotes);
  const [saved, setSaved] = useState(initialSaved);
  const [showComments, setShowComments] = useState(false);
  const [commentList, setCommentList] = useState<Comment[]>(MOCK_COMMENTS);
  const [newComment, setNewComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editPreview, setEditPreview] = useState(preview);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentPreview, setCurrentPreview] = useState(preview);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: `c-${Date.now()}`,
      author: "You",
      content: newComment,
      timeAgo: "now",
      karma: 100,
      petColor: "hsl(252, 75%, 60%)",
      petExpression: "happy",
    };
    setCommentList((prev) => [...prev, comment]);
    setNewComment("");
  };

  const handleSaveEdit = () => {
    setCurrentTitle(editTitle);
    setCurrentPreview(editPreview);
    setIsEditing(false);
    onEdit?.(editTitle, editPreview);
  };

  const handleCancelEdit = () => {
    setEditTitle(currentTitle);
    setEditPreview(currentPreview);
    setIsEditing(false);
  };

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
        {editable && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Pencil size={14} />
          </button>
        )}
      </div>

      {/* Flair */}
      <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full mb-2 ${flairColors[flair] || "bg-muted text-muted-foreground"}`}>
        {flair}
      </span>

      {/* Content */}
      {isEditing ? (
        <div className="space-y-2 mb-4">
          <input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full font-display font-bold text-lg text-foreground bg-muted rounded-xl px-3 py-2 border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <textarea
            value={editPreview}
            onChange={(e) => setEditPreview(e.target.value)}
            rows={3}
            className="w-full text-sm text-foreground bg-muted rounded-xl px-3 py-2 border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-display font-bold hover:bg-primary/90 transition-colors"
            >
              <Check size={13} /> Save
            </button>
            <button
              onClick={handleCancelEdit}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-muted text-muted-foreground text-xs font-display font-bold hover:bg-muted/80 transition-colors"
            >
              <X size={13} /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <h3 className="font-display font-bold text-lg text-foreground mb-1 leading-snug">{currentTitle}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4">{currentPreview}</p>
        </>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleLike}
          className={`flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-full ${
            liked
              ? "text-accent bg-accent/10"
              : "text-muted-foreground hover:text-accent hover:bg-accent/10"
          }`}
        >
          <Heart size={16} fill={liked ? "currentColor" : "none"} />
          <span className="text-sm font-medium">{likeCount}</span>
        </motion.button>
        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-full ${
            showComments
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-primary hover:bg-primary/10"
          }`}
        >
          <MessageCircle size={16} />
          <span className="text-sm font-medium">{commentList.length}</span>
        </button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={async () => {
            if (!user || !supabase || !id) {
              setSaved(!saved);
              return;
            }
            const newSaved = !saved;
            setSaved(newSaved);
            try {
              if (newSaved) {
                await (supabase as any).from("saved_posts").insert({ user_id: user.id, post_id: id });
              } else {
                await (supabase as any).from("saved_posts").delete().eq("user_id", user.id).eq("post_id", id);
              }
              onSaveToggle?.(id, newSaved);
            } catch {
              setSaved(!newSaved);
            }
          }}
          className={`p-1.5 rounded-full ml-auto transition-colors ${
            saved
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-primary hover:bg-primary/10"
          }`}
        >
          <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
        </motion.button>
        <button className="text-muted-foreground hover:text-primary transition-colors p-1.5 rounded-full hover:bg-primary/10">
          <Share2 size={16} />
        </button>
      </div>

      {/* Comments section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-border space-y-3">
              {commentList.map((c) => {
                const cTier = getKarmaTier(c.karma);
                return (
                  <div key={c.id} className="flex gap-2.5 group">
                    <MyndPet size={28} color={c.petColor} expression={c.petExpression} level={cTier.level} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-display font-bold text-xs text-foreground">{c.author}</span>
                        <span className="text-[10px] text-muted-foreground">· {c.timeAgo}</span>
                      </div>
                      <p className="text-sm text-foreground/85 mt-0.5">{c.content}</p>
                    </div>
                    {editable && (
                      <button
                        onClick={() => setCommentList((prev) => prev.filter((cm) => cm.id !== c.id))}
                        className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100 shrink-0 self-start"
                        title="Delete comment"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                );
              })}

              {/* New comment input */}
              <div className="flex gap-2 items-center pt-1">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                  placeholder="Write a comment..."
                  className="flex-1 bg-muted rounded-xl px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 border border-border"
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className={`p-2 rounded-xl transition-colors ${
                    newComment.trim()
                      ? "text-primary hover:bg-primary/10"
                      : "text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  <MessageCircle size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
