import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Vote, Plus, Clock, CheckCircle2, Users } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface Poll {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  target_buildings: string[];
  status: string;
  created_at: string;
  vote_count?: number;
}

export default function PollsPage() {
  const { user, role, isAdmin } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const isDemoAdmin = sessionStorage.getItem("demo_admin") === "true";
  const canCreate = isAdmin || isDemoAdmin || role === "representative" || role === "admin";

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    const { data } = await supabase
      .from("polls")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      const pollsWithCounts = await Promise.all(
        data.map(async (p: any) => {
          const { count } = await supabase
            .from("poll_votes")
            .select("*", { count: "exact", head: true })
            .eq("poll_id", p.id);
          return { ...p, vote_count: count || 0 };
        })
      );
      setPolls(pollsWithCounts);
    }
  };

  const isActive = (p: Poll) => new Date(p.end_date) > new Date() && p.status === "active";

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Vote className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">투표</h1>
              <p className="text-xs text-muted-foreground">우리 단지 주요 안건에 투표하세요</p>
            </div>
          </div>
          {canCreate && (
            <Link to="/polls/create"
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">
              <Plus className="h-4 w-4" /> 투표 만들기
            </Link>
          )}
        </div>

        <div className="space-y-3">
          {polls.map((p, i) => {
            const active = isActive(p);
            return (
              <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/polls/${p.id}`}
                  className="block rounded-xl border bg-card p-4 shadow-card hover:shadow-card-md transition-all hover:-translate-y-0.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {active ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">
                            <Clock className="h-3 w-3" /> 진행중
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted text-muted-foreground px-2 py-0.5 text-xs font-medium">
                            <CheckCircle2 className="h-3 w-3" /> 종료
                          </span>
                        )}
                        {p.target_buildings?.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {p.target_buildings.length === 10 ? "전체 동" : p.target_buildings.join(", ")}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-foreground">{p.title}</h3>
                      {p.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</p>}
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>~{format(new Date(p.end_date), "M.d(EEE)", { locale: ko })}</span>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {p.vote_count}명 참여</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
          {polls.length === 0 && (
            <div className="rounded-xl border bg-card p-12 text-center shadow-card">
              <Vote className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">등록된 투표가 없습니다.</p>
            </div>
          )}
        </div>
      </motion.div>
    </AppLayout>
  );
}
