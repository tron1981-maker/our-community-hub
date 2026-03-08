import { Link } from "react-router-dom";
import { MessageSquare, Eye, Heart, Pin, AlertTriangle, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserBadge } from "./UserBadge";
import type { Post } from "@/lib/mockData";
import { motion } from "framer-motion";

interface PostCardProps {
  post: Post;
  index?: number;
}

export function PostCard({ post, index = 0 }: PostCardProps) {
  const isMarket = post.boardType === "market";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link
        to={`/post/${post.id}`}
        className={cn(
          "group block rounded-xl border bg-card p-4 shadow-card transition-all hover:shadow-card-md hover:-translate-y-0.5",
          post.urgent && "border-destructive/30 bg-destructive/5",
          post.pinned && !post.urgent && "border-primary/20 bg-primary/5"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              {post.pinned && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                  <Pin className="h-3 w-3" /> 고정
                </span>
              )}
              {post.urgent && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-destructive">
                  <AlertTriangle className="h-3 w-3" /> 긴급
                </span>
              )}
              {isMarket && post.status && (
                <span className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium",
                  post.status === "판매중" && "bg-success/10 text-success",
                  post.status === "예약중" && "bg-warning/10 text-warning",
                  post.status === "판매완료" && "bg-muted text-muted-foreground"
                )}>
                  {post.status}
                </span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {post.title}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{post.content}</p>

            {isMarket && post.price !== undefined && (
              <p className="mt-2 text-sm font-bold text-foreground">
                {post.price === 0 ? "나눔 🎁" : `${post.price.toLocaleString()}원`}
              </p>
            )}

            <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <UserBadge level={post.authorLevel} className="scale-90 origin-left" />
                <span>{post.author}</span>
              </span>
              <span>·</span>
              <span>{post.createdAt.split(" ")[0].slice(5)}</span>
              <div className="ml-auto flex items-center gap-3">
                <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.views}</span>
                <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{post.commentCount}</span>
                {post.likes > 0 && (
                  <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{post.likes}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
