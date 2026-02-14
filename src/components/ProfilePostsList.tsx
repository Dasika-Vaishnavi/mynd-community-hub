import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PostCard } from "./PostCard";
import { FileText } from "lucide-react";

const toTimeAgo = (isoDate: string) => {
  const diffInHours = Math.max(1, Math.floor((Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60)));
  if (diffInHours < 24) return `${diffInHours}h`;
  return `${Math.floor(diffInHours / 24)}d`;
};

export const ProfilePostsList = () => {
  const { user } = useAuth();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["user-posts", user?.id],
    queryFn: async () => {
      if (!supabase || !user) return [];
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("author_id", user.id)
        .order("created_at", { ascending: false });

      if (error || !data) return [];
      return data;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return <p className="text-sm text-muted-foreground text-center py-8">Loading your posts...</p>;
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText size={24} className="mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No posts yet</p>
        <p className="text-xs text-muted-foreground mt-1">Share your thoughts in the community to see them here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
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
          petExpression={(post.pet_expression as "happy" | "calm" | "sleepy" | "excited") ?? "happy"}
          editable={true}
          initialSaved={false}
        />
      ))}
    </div>
  );
};
