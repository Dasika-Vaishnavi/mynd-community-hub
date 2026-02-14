import { MessageCircle } from "lucide-react";
import { MyndPet, getKarmaTier } from "./MyndPet";

// Comments aren't stored in DB yet — show mock history for now
const MOCK_COMMENTS = [
  {
    id: "uc1",
    postTitle: "How I'm learning to set boundaries",
    space: "Self-Growth",
    content: "This really resonated with me. I've been working on the same thing — it's hard but so worth it 💜",
    timeAgo: "2h",
    upvotes: 14,
  },
  {
    id: "uc2",
    postTitle: "Meditation changed my mornings",
    space: "Mindfulness",
    content: "Have you tried box breathing? It's been a game changer for me before meetings.",
    timeAgo: "1d",
    upvotes: 8,
  },
  {
    id: "uc3",
    postTitle: "Dealing with imposter syndrome at work",
    space: "Anxiety",
    content: "You're not alone in this. Something that helped me was keeping a 'wins' journal — writing down one thing I did well each day.",
    timeAgo: "3d",
    upvotes: 22,
  },
  {
    id: "uc4",
    postTitle: "First therapy session today!",
    space: "Celebrations",
    content: "So proud of you! The first step is always the hardest. You've got this 🌟",
    timeAgo: "5d",
    upvotes: 31,
  },
];

export const ProfileCommentsList = () => {
  if (MOCK_COMMENTS.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageCircle size={24} className="mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No comments yet</p>
        <p className="text-xs text-muted-foreground mt-1">Join conversations in the community</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {MOCK_COMMENTS.map((comment) => (
        <div
          key={comment.id}
          className="bg-card rounded-2xl shadow-soft p-4 hover:shadow-card transition-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle size={14} className="text-primary" />
            <span className="text-xs text-muted-foreground">
              Replied in <span className="font-medium text-foreground">m/{comment.space}</span>
            </span>
            <span className="text-xs text-muted-foreground">· {comment.timeAgo}</span>
          </div>
          <p className="text-xs text-muted-foreground mb-1.5 line-clamp-1">
            On: <span className="font-medium text-foreground/80">{comment.postTitle}</span>
          </p>
          <p className="text-sm text-foreground/90 leading-relaxed">{comment.content}</p>
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <span>❤️ {comment.upvotes}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
