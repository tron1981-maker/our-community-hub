import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { PostCard } from "@/components/PostCard";
import { getPostsByBoard } from "@/lib/mockData";
import { BUILDINGS } from "@/lib/buildings";
import { Megaphone, MessageSquare, ShoppingBag, FileText, Plus, Search, Filter } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const boardConfig: Record<string, { title: string; icon: typeof Megaphone; desc: string }> = {
  notice: { title: "공지사항", icon: Megaphone, desc: "관리사무소에서 전달하는 공지사항입니다." },
  free: { title: "자유게시판", icon: MessageSquare, desc: "주민 간 자유로운 소통 공간입니다." },
  market: { title: "장터", icon: ShoppingBag, desc: "중고거래와 나눔을 위한 공간입니다." },
  complaint: { title: "민원/건의", icon: FileText, desc: "관리사무소에 전달되는 비공개 게시판입니다." },
};

export default function BoardPage() {
  const { boardType } = useParams<{ boardType: string }>();
  const config = boardConfig[boardType || "free"];
  const posts = getPostsByBoard(boardType || "free");
  const [search, setSearch] = useState("");
  const [buildingFilter, setBuildingFilter] = useState("");
  const Icon = config?.icon || MessageSquare;
  const isFreeBoard = boardType === "free";

  const filtered = posts.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.content.toLowerCase().includes(search.toLowerCase());
    const matchBuilding = !buildingFilter || p.authorUnit.includes(buildingFilter.replace("동", ""));
    return matchSearch && matchBuilding;
  });

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{config?.title}</h1>
              <p className="text-xs text-muted-foreground">{config?.desc}</p>
            </div>
          </div>
          {boardType !== "notice" && (
            <button className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">
              <Plus className="h-4 w-4" /> 글쓰기
            </button>
          )}
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="검색어를 입력하세요..."
              className="w-full rounded-xl border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-card"
            />
          </div>
          {isFreeBoard && (
            <select value={buildingFilter} onChange={e => setBuildingFilter(e.target.value)}
              className="rounded-xl border bg-card px-3 py-2.5 text-sm text-foreground shadow-card">
              <option value="">전체 동</option>
              {BUILDINGS.map(b => <option key={b} value={b}>{b}</option>)}
              <option value="my">내 동만 보기</option>
            </select>
          )}
        </div>

        {/* Posts */}
        <div className="space-y-2">
          {filtered.length > 0 ? (
            filtered.map((p, i) => <PostCard key={p.id} post={p} index={i} />)
          ) : (
            <div className="rounded-xl border bg-card p-12 text-center shadow-card">
              <p className="text-muted-foreground">게시글이 없습니다.</p>
            </div>
          )}
        </div>
      </motion.div>
    </AppLayout>
  );
}
