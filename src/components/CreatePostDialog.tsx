import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const INITIAL_FORM = {
  title: "",
  preview: "",
  flair: "Story",
  space: "UnwindYourMynd",
};

export const CreatePostDialog = ({ open, onOpenChange }: CreatePostDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);

  const authorName = useMemo(() => {
    if (!user) return "";

    const username = user.user_metadata?.username;
    if (typeof username === "string" && username.trim()) return username.trim();

    if (user.email) {
      const localPart = user.email.split("@")[0];
      if (localPart) return localPart;
    }

    return "Anonymous";
  }, [user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabase || !user) {
      toast({
        title: "Sign in required",
        description: "Please sign in before creating a post.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await (supabase as any).from("posts").insert({
        author_id: user.id,
        author_name: authorName,
        author_karma: 0,
        title: form.title.trim(),
        preview: form.preview.trim(),
        flair: form.flair.trim(),
        space: form.space.trim(),
        upvotes: 0,
        comments: 0,
        pet_expression: "happy",
      });

      if (error) throw new Error(error.message);

      await queryClient.invalidateQueries({ queryKey: ["posts-feed"] });

      toast({
        title: "Post created",
        description: "Your post was saved to Supabase.",
      });

      setForm(INITIAL_FORM);
      onOpenChange(false);
    } catch (submitError) {
      toast({
        title: "Could not create post",
        description: submitError instanceof Error ? submitError.message : "Insert failed.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
          <DialogDescription>Write a new post to save in Supabase.</DialogDescription>
        </DialogHeader>

        {!user ? (
          <div className="text-sm text-muted-foreground">
            You must be signed in to create posts. <Link to="/auth" className="text-primary underline">Go to auth</Link>
          </div>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="post-title">Title</Label>
            <Input
              id="post-title"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="What is on your mind?"
              maxLength={120}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="post-preview">Content</Label>
            <Textarea
              id="post-preview"
              value={form.preview}
              onChange={(event) => setForm((prev) => ({ ...prev, preview: event.target.value }))}
              placeholder="Share your thoughts"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="post-flair">Flair</Label>
              <Input
                id="post-flair"
                value={form.flair}
                onChange={(event) => setForm((prev) => ({ ...prev, flair: event.target.value }))}
                placeholder="Story"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="post-space">Space</Label>
              <Input
                id="post-space"
                value={form.space}
                onChange={(event) => setForm((prev) => ({ ...prev, space: event.target.value }))}
                placeholder="UnwindYourMynd"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={!user || isSubmitting}>
              {isSubmitting ? "Publishing..." : "Publish"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
