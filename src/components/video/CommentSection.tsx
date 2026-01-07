import { useState } from "react";
import { Heart, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Comment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  likes: number;
  isLiked: boolean;
  time: string;
}

const initialComments: Comment[] = [
  {
    id: "1",
    user: "Luna ⭐",
    avatar: "L",
    text: "This is so fun! I love dancing to this song! 💃",
    likes: 24,
    isLiked: false,
    time: "2h ago",
  },
  {
    id: "2",
    user: "Max 🎮",
    avatar: "M",
    text: "Best video ever! Can't stop watching! 🌈",
    likes: 18,
    isLiked: true,
    time: "5h ago",
  },
  {
    id: "3",
    user: "Sophie 🦋",
    avatar: "S",
    text: "I showed this to my little sister and she loved it too! 💖",
    likes: 32,
    isLiked: false,
    time: "1d ago",
  },
];

const CommentSection = () => {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");

  const handleLike = (id: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 }
          : c
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      user: "Sara 🎀",
      avatar: "S",
      text: newComment,
      likes: 0,
      isLiked: false,
      time: "Just now",
    };

    setComments([comment, ...comments]);
    setNewComment("");
  };

  return (
    <div className="bg-card rounded-3xl shadow-card p-6">
      <h3 className="font-display text-xl font-bold flex items-center gap-2 mb-6">
        <Sparkles className="h-5 w-5 text-sara-yellow" />
        Comments ({comments.length})
      </h3>

      {/* Add comment */}
      <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-gradient-button flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
          S
        </div>
        <div className="flex-1 flex gap-2">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a fun comment! ✨"
            className="flex-1 rounded-full"
          />
          <Button type="submit" variant="hero" size="icon" className="rounded-full">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>

      {/* Comments list */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 group">
            <div className="w-10 h-10 rounded-full bg-sara-purple-light flex items-center justify-center text-sara-purple font-bold flex-shrink-0">
              {comment.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-sm">
                  {comment.user}
                </span>
                <span className="text-xs text-muted-foreground">
                  {comment.time}
                </span>
              </div>
              <p className="text-sm mt-1">{comment.text}</p>
              <button
                onClick={() => handleLike(comment.id)}
                className="flex items-center gap-1 mt-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Heart
                  className={`h-4 w-4 transition-all ${
                    comment.isLiked
                      ? "fill-sara-coral text-sara-coral scale-110"
                      : ""
                  }`}
                />
                <span>{comment.likes}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
