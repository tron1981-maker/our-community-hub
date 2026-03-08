import { useState } from "react";
import { cn } from "@/lib/utils";
import { UserBadge, AuthorBadge } from "./UserBadge";
import { MessageSquare, CornerDownRight, Send } from "lucide-react";
import type { Comment } from "@/lib/mockData";
import { motion, AnimatePresence } from "framer-motion";

interface CommentSectionProps {
  comments: Comment[];
}

function CommentItem({
  comment,
  depth = 0,
  isLast = false,
  onReply,
}: {
  comment: Comment;
  depth?: number;
  isLast?: boolean;
  onReply: (parentId: number, text: string) => void;
}) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [reactions, setReactions] = useState(comment.reactions);

  const toggleReaction = (emoji: string) => {
    setReactions(prev =>
      prev.map(r =>
        r.emoji === emoji
          ? { ...r, count: r.reacted ? r.count - 1 : r.count + 1, reacted: !r.reacted }
          : r
      )
    );
  };

  const handleSubmitReply = () => {
    const trimmed = replyText.trim();
    if (!trimmed) return;
    onReply(comment.id, trimmed);
    setReplyText("");
    setShowReply(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitReply();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: depth > 0 ? -8 : 0 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn("relative", depth > 0 && "ml-8 pl-4 border-l-2 border-border")}
    >
      <div className="py-3">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {comment.author.charAt(0)}
          </div>
          <span className="text-sm font-semibold text-foreground">{comment.author}</span>
          <UserBadge level={comment.authorLevel} className="scale-90" />
          {comment.isAuthor && <AuthorBadge />}
          <span className="text-xs text-muted-foreground ml-auto">{comment.createdAt.split(" ")[1]}</span>
        </div>
        <p className="text-sm text-foreground/90 ml-9">{comment.content}</p>

        {/* Reactions */}
        <div className="ml-9 mt-2 flex flex-wrap items-center gap-1.5">
          {reactions.map(r => (
            <button
              key={r.emoji}
              onClick={() => toggleReaction(r.emoji)}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors",
                r.reacted
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border bg-muted/50 text-muted-foreground hover:border-primary/20"
              )}
            >
              {r.emoji} {r.count}
            </button>
          ))}
          <button className="rounded-full border border-dashed border-border px-2 py-0.5 text-xs text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors">
            +
          </button>
        </div>

        {/* Actions */}
        <div className="ml-9 mt-2 flex items-center gap-3">
          <button
            onClick={() => setShowReply(!showReply)}
            className={cn(
              "flex items-center gap-1 text-xs transition-colors",
              showReply ? "text-primary font-medium" : "text-muted-foreground hover:text-primary"
            )}
          >
            <CornerDownRight className="h-3 w-3" /> 답글
          </button>
        </div>

        {/* Reply input */}
        <AnimatePresence>
          {showReply && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="ml-9 mt-2 overflow-hidden"
            >
              <div className="flex items-center gap-2">
                <input
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="답글을 입력하세요..."
                  className="flex-1 rounded-lg border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  autoFocus
                />
                <button
                  onClick={handleSubmitReply}
                  disabled={!replyText.trim()}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {!isLast && depth === 0 && <div className="border-b" />}
    </motion.div>
  );
}

export function CommentSection({ comments: initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [sortMode, setSortMode] = useState<"popular" | "latest">("popular");

  const rootComments = comments.filter(c => !c.parentId);
  const sortedRootComments = [...rootComments].sort((a, b) => {
    if (sortMode === "popular") {
      const aScore = a.reactions.reduce((sum, r) => sum + r.count, 0) + a.likes;
      const bScore = b.reactions.reduce((sum, r) => sum + r.count, 0) + b.likes;
      return bScore - aScore;
    }
    return b.id - a.id; // latest by id
  });
  const getChildren = (parentId: number) => comments.filter(c => c.parentId === parentId);

  const nextId = () => Math.max(0, ...comments.map(c => c.id)) + 1;

  const addComment = (text: string, parentId: number | null = null) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const newC: Comment = {
      id: nextId(),
      postId: comments[0]?.postId ?? 0,
      author: "나",
      authorLevel: 1,
      authorUnit: "",
      content: trimmed,
      createdAt: new Date().toLocaleString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false }),
      likes: 0,
      isAuthor: false,
      parentId,
      reactions: [],
    };
    setComments(prev => [...prev, newC]);
  };

  const handleRootSubmit = () => {
    addComment(newComment);
    setNewComment("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleRootSubmit();
    }
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <MessageSquare className="h-4 w-4 text-primary" />
          댓글 {comments.length}개
        </h3>
        <div className="flex rounded-lg border bg-muted/50 p-0.5 text-xs">
          <button
            onClick={() => setSortMode("popular")}
            className={cn(
              "rounded-md px-3 py-1 font-medium transition-colors",
              sortMode === "popular" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            인기순
          </button>
          <button
            onClick={() => setSortMode("latest")}
            className={cn(
              "rounded-md px-3 py-1 font-medium transition-colors",
              sortMode === "latest" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            최신순
          </button>
        </div>
      </div>

      {/* Comment input */}
      <div className="mb-4 flex items-start gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary mt-1">
          나
        </div>
        <div className="flex-1">
          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="댓글을 입력하세요..."
            rows={2}
            className="w-full rounded-xl border bg-muted/30 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
          <div className="mt-2 flex justify-end">
            <button
              onClick={handleRootSubmit}
              disabled={!newComment.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              등록
            </button>
          </div>
        </div>
      </div>

      {/* Comments list */}
      <div className="rounded-xl border bg-card">
        {sortedRootComments.map((comment, i) => {
          const children = getChildren(comment.id);
          return (
            <div key={comment.id}>
              <CommentItem
                comment={comment}
                isLast={i === rootComments.length - 1 && children.length === 0}
                onReply={(parentId, text) => addComment(text, parentId)}
              />
              {children.map(child => (
                <CommentItem
                  key={child.id}
                  comment={child}
                  depth={1}
                  onReply={(parentId, text) => addComment(text, parentId)}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
