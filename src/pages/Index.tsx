import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { PostCard } from "@/components/PostCard";
import { mockPosts } from "@/lib/mockData";
import { Megaphone, MessageSquare, ShoppingBag, ChevronRight, AlertTriangle, Users, Building2 } from "lucide-react";
import { motion } from "framer-motion";

const boardLinks = [
  { path: "/board/notice", label: "공지사항", icon: Megaphone, desc: "관리사무소 공지" },
  { path: "/board/free", label: "자유게시판", icon: MessageSquare, desc: "주민 소통 공간" },
  { path: "/board/market", label: "장터", icon: ShoppingBag, desc: "중고거래·나눔" },
];

export default function Index() {
  const notices = mockPosts.filter(p => p.boardType === "notice").slice(0, 2);
  const freePosts = mockPosts.filter(p => p.boardType === "free").slice(0, 3);
  const marketPosts = mockPosts.filter(p => p.boardType === "market").slice(0, 2);

  return (
    <AppLayout>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 rounded-2xl bg-primary p-6 sm:p-8"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/20">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-primary-foreground">래미안 더 포레스트</h1>
            <p className="text-sm text-primary-foreground/70">총 1,200세대 · 입주민 전용</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-primary-foreground/10 p-3 text-center backdrop-blur-sm">
            <p className="text-2xl font-bold text-primary-foreground">847</p>
            <p className="text-xs text-primary-foreground/70">가입 주민</p>
          </div>
          <div className="rounded-xl bg-primary-foreground/10 p-3 text-center backdrop-blur-sm">
            <p className="text-2xl font-bold text-primary-foreground">23</p>
            <p className="text-xs text-primary-foreground/70">오늘 게시글</p>
          </div>
          <div className="rounded-xl bg-primary-foreground/10 p-3 text-center backdrop-blur-sm">
            <p className="text-2xl font-bold text-primary-foreground">5</p>
            <p className="text-xs text-primary-foreground/70">장터 등록</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Board Links */}
      <div className="mb-8 grid grid-cols-3 gap-3">
        {boardLinks.map((b, i) => {
          const Icon = b.icon;
          return (
            <motion.div key={b.path} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
              <Link
                to={b.path}
                className="flex flex-col items-center rounded-xl border bg-card p-4 shadow-card transition-all hover:shadow-card-md hover:-translate-y-0.5 text-center"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 mb-2">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">{b.label}</span>
                <span className="text-xs text-muted-foreground mt-0.5">{b.desc}</span>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Urgent notices */}
      {notices.some(n => n.urgent) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          {notices.filter(n => n.urgent).map(n => (
            <Link key={n.id} to={`/post/${n.id}`} className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 mb-2 hover:bg-destructive/10 transition-colors">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate">{n.title}</p>
                <p className="text-xs text-muted-foreground">{n.createdAt.split(" ")[0]}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </Link>
          ))}
        </motion.div>
      )}

      {/* Recent notices */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
            <Megaphone className="h-4 w-4 text-primary" /> 공지사항
          </h2>
          <Link to="/board/notice" className="flex items-center gap-1 text-xs text-primary hover:underline">
            더보기 <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="space-y-2">
          {notices.map((p, i) => <PostCard key={p.id} post={p} index={i} />)}
        </div>
      </section>

      {/* Free board */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
            <MessageSquare className="h-4 w-4 text-primary" /> 자유게시판
          </h2>
          <Link to="/board/free" className="flex items-center gap-1 text-xs text-primary hover:underline">
            더보기 <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="space-y-2">
          {freePosts.map((p, i) => <PostCard key={p.id} post={p} index={i} />)}
        </div>
      </section>

      {/* Market */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
            <ShoppingBag className="h-4 w-4 text-primary" /> 장터
          </h2>
          <Link to="/board/market" className="flex items-center gap-1 text-xs text-primary hover:underline">
            더보기 <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="space-y-2">
          {marketPosts.map((p, i) => <PostCard key={p.id} post={p} index={i} />)}
        </div>
      </section>
    </AppLayout>
  );
}
