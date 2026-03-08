import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Vote, Clock, CheckCircle2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";

interface PollOption {
  id: string;
  option_text: string;
  vote_count: number;
}

interface Poll {
  id: string;
  title: string;
  description: string;
  end_date: string;
  target_buildings: string[];
  status: string;
}

export default function PollDetailPage() {
  const { pollId } = useParams<{ pollId: string }>();
  const { user } = useAuth();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [options, setOptions] = useState<PollOption[]>([]);
  const [myVote, setMyVote] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    if (pollId) fetchPoll();
  }, [pollId]);

  const fetchPoll = async () => {
    const { data: pollData } = await supabase
      .from("polls")
      .select("*")
      .eq("id", pollId)
      .single();
    if (pollData) setPoll(pollData as Poll);

    const { data: optData } = await supabase
      .from("poll_options")
      .select("*")
      .eq("poll_id", pollId);

    if (optData) {
      const withCounts = await Promise.all(
        optData.map(async (o: any) => {
          const { count } = await supabase
            .from("poll_votes")
            .select("*", { count: "exact", head: true })
            .eq("option_id", o.id);
          return { ...o, vote_count: count || 0 };
        })
      );
      setOptions(withCounts);
      setTotalVotes(withCounts.reduce((s, o) => s + o.vote_count, 0));
    }

    if (user) {
      const { data: voteData } = await supabase
        .from("poll_votes")
        .select("option_id")
        .eq("poll_id", pollId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (voteData) {
        setMyVote(voteData.option_id);
        setSelected(voteData.option_id);
      }
    }
  };

  const isActive = poll && new Date(poll.end_date) > new Date() && poll.status === "active";

  const handleVote = async () => {
    if (!user || !selected || !pollId) {
      toast({ title: "로그인이 필요합니다.", variant: "destructive" });
      return;
    }
    if (myVote) {
      // Change vote
      await supabase.from("poll_votes").delete().eq("poll_id", pollId).eq("user_id", user.id);
    }
    await supabase.from("poll_votes").insert({ poll_id: pollId, option_id: selected, user_id: user.id });
    toast({ title: "투표가 완료되었습니다!" });
    fetchPoll();
  };

  if (!poll) {
    return <AppLayout><div className="flex items-center justify-center py-20"><p className="text-muted-foreground">로딩 중...</p></div></AppLayout>;
  }

  const maxVotes = Math.max(...options.map(o => o.vote_count), 1);

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            {isActive ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">
                <Clock className="h-3 w-3" /> 진행중
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted text-muted-foreground px-2 py-0.5 text-xs font-medium">
                <CheckCircle2 className="h-3 w-3" /> 종료
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              ~{format(new Date(poll.end_date), "yyyy.M.d(EEE) HH:mm", { locale: ko })}
            </span>
          </div>
          <h1 className="text-xl font-bold text-foreground">{poll.title}</h1>
          {poll.description && <p className="text-sm text-muted-foreground mt-2">{poll.description}</p>}
          {poll.target_buildings?.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              대상: {poll.target_buildings.length === 10 ? "전체 동" : poll.target_buildings.join(", ")}
            </p>
          )}
        </div>

        {/* Options with bar chart */}
        <div className="space-y-3 mb-6">
          {options.map(o => {
            const pct = totalVotes > 0 ? Math.round((o.vote_count / totalVotes) * 100) : 0;
            const isSelected = selected === o.id;
            const isMyVote = myVote === o.id;

            return (
              <button
                key={o.id}
                onClick={() => isActive && setSelected(o.id)}
                disabled={!isActive}
                className={`w-full text-left rounded-xl border p-4 transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border bg-card hover:bg-muted/30"
                } ${!isActive ? "cursor-default" : "cursor-pointer"}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground flex items-center gap-2">
                    {o.option_text}
                    {isMyVote && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                  </span>
                  <span className="text-sm font-bold text-foreground">{pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={`h-full rounded-full ${isMyVote ? "bg-primary" : "bg-primary/50"}`}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{o.vote_count}표</p>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" /> 총 {totalVotes}명 참여
          </span>
          {isActive && (
            <Button onClick={handleVote} disabled={!selected}>
              {myVote ? "투표 변경" : "투표하기"}
            </Button>
          )}
        </div>
      </motion.div>
    </AppLayout>
  );
}
