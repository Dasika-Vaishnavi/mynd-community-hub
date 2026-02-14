import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PostCard } from "./PostCard";
import { Bookmark } from "lucide-react";

const toTimeAgo = (isoDate: string) => {
  const diffInHours = Math.max(1, Math.floor((Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60)));
  if (diffInHours < 24) return `${diffInHours}h`;
  return `${Math.floor(diffInHours / 24)}d`;
};

export const SavedPostsList = () => {
  const { user } = useAuth();

  const { data: savedPosts = [], isLoading, refetch } = useQuery({
    queryKey: ["saved-posts", user?.id],
    queryFn: async () => {
      if (!supabase || !user) return [];
      const { data, error } = await (supabase as any)
        .from("saved_posts")
        .select("post_id, posts:post_id(id, author_name, author_karma, created_at, title, preview, flair, space, upvotes, comments, pet_color, pet_expression)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error || !data) return [];
      return data.map((row: any) => row.posts).filter(Boolean);
    },
    enabled: !!user,
  });

  if (isLoading) {
    return <p className="text-sm text-muted-foreground text-center py-8">Loading saved posts...</p>;
  }

  if (savedPosts.length === 0) {
    return (
      <div className="text-center py-8">
        <Bookmark size={24} className="mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No saved posts yet</p>
        <p className="text-xs text-muted-foreground mt-1">Bookmark posts from the feed to see them here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {savedPosts.map((post: any) => (
        <PostCard
          key={post.id}
          id={post.id}
          author={post.author_name}
          karma={post.author_karma}
          timeAgo={toTimeAgo(post.created_at)}
          title={post.title}
          preview={post.preview}
          flair={post.flair}
          space={post.space}
          upvotes={post.upvotes}
          comments={post.comments}
          petColor={post.pet_color ?? "hsl(252, 75%, 60%)"}
          petExpression={post.pet_expression ?? "happy"}
          editable={false}
          initialSaved={true}
          onSaveToggle={() => refetch()}
        />
      ))}
    </div>
  );
};
