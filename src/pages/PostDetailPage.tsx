import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { CommentSection } from "@/components/CommentSection";
import { UserBadge } from "@/components/UserBadge";
import { getPostById, getCommentsByPostId } from "@/lib/mockData";
import { ArrowLeft, Eye, Heart, Share2, Bookmark, Clock, MapPin } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const post = getPostById(Number(postId));
  const comments = getCommentsByPostId(Number(postId));
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post?.likes || 0);
  const [saved, setSaved] = useState(false);

  if (!post) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-muted-foreground">게시글을 찾을 수 없습니다.</p>
          <Link to="/" className="mt-4 text-sm text-primary hover:underline">홈으로 돌아가기</Link>
        </div>
      </AppLayout>
    );
  }

  const boardPath = `/board/${post.boardType}`;
  const isMarket = post.boardType === "market";

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
        {/* Back */}
        <Link to={boardPath} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" /> 목록으로
        </Link>

        {/* Post content */}
        <article className="rounded-xl border bg-card p-5 sm:p-6 shadow-card">
          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {post.urgent && (
              <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive">긴급</span>
            )}
            {post.pinned && (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">고정</span>
            )}
            {isMarket && post.status && (
              <span className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-medium",
                post.status === "판매중" && "bg-success/10 text-success",
                post.status === "예약중" && "bg-warning/10 text-warning",
                post.status === "판매완료" && "bg-muted text-muted-foreground"
              )}>
                {post.status}
              </span>
            )}
          </div>

          <h1 className="text-lg sm:text-xl font-bold text-foreground mb-3">{post.title}</h1>

          {/* Author info */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {post.author.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{post.author}</span>
                <UserBadge level={post.authorLevel} />
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{post.authorUnit}</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.createdAt}</span>
              </div>
            </div>
          </div>

          {/* Price for market */}
          {isMarket && post.price !== undefined && (
            <div className="mb-4 rounded-xl bg-muted/50 p-4">
              <p className="text-2xl font-bold text-foreground">
                {post.price === 0 ? "나눔 🎁" : `${post.price.toLocaleString()}원`}
              </p>
            </div>
          )}

          {/* Content */}
          <div className="prose prose-sm max-w-none text-foreground/90 whitespace-pre-wrap leading-relaxed">
            {post.content}
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center gap-2 border-t pt-4">
            <button
              onClick={() => { setLiked(!liked); setLikeCount(prev => liked ? prev - 1 : prev + 1); }}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors",
                liked ? "border-destructive/30 bg-destructive/5 text-destructive" : "text-muted-foreground hover:bg-muted"
              )}
            >
              <Heart className={cn("h-4 w-4", liked && "fill-current")} />
              {likeCount > 0 && likeCount}
              {likeCount === 0 && "좋아요"}
            </button>
            <button
              onClick={() => setSaved(!saved)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors",
                saved ? "border-primary/30 bg-primary/5 text-primary" : "text-muted-foreground hover:bg-muted"
              )}
            >
              <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
              저장
            </button>
            <button className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors ml-auto">
              <Share2 className="h-4 w-4" /> 공유
            </button>
          </div>

          {/* View count */}
          <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="h-3 w-3" /> 조회 {post.views}
          </div>
        </article>

        {/* Comments */}
        <CommentSection comments={comments} />
      </motion.div>
    </AppLayout>
  );
}
