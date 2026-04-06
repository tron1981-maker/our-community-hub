import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { BUILDINGS } from "@/lib/buildings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Vote } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function CreatePollPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isDemoAdmin = sessionStorage.getItem("demo_admin") === "true";
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [endDate, setEndDate] = useState("");
  const [selectedBuildings, setSelectedBuildings] = useState<string[]>([...BUILDINGS]);
  const [submitting, setSubmitting] = useState(false);

  const toggleBuilding = (b: string) => {
    setSelectedBuildings(prev =>
      prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]
    );
  };

  const toggleAll = () => {
    setSelectedBuildings(prev => prev.length === BUILDINGS.length ? [] : [...BUILDINGS]);
  };

  const addOption = () => setOptions(prev => [...prev, ""]);
  const removeOption = (i: number) => setOptions(prev => prev.filter((_, idx) => idx !== i));
  const updateOption = (i: number, val: string) => setOptions(prev => prev.map((o, idx) => idx === i ? val : o));

  const handleSubmit = async () => {
    if (!title.trim() || !endDate || options.filter(o => o.trim()).length < 2) {
      toast({ title: "제목, 마감일, 최소 2개 선택지가 필요합니다.", variant: "destructive" });
      return;
    }
    if (!user && !isDemoAdmin) {
      toast({ title: "로그인이 필요합니다.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const pollData: Record<string, unknown> = {
      title: title.trim(),
      description: description.trim(),
      end_date: new Date(endDate).toISOString(),
      target_buildings: selectedBuildings,
    };
    if (user) pollData.created_by = user.id;

    const { data: poll, error } = await supabase.from("polls").insert(pollData).select().single();

    if (error || !poll) {
      toast({ title: "투표 생성 실패", variant: "destructive" });
      setSubmitting(false);
      return;
    }

    const optionRows = options.filter(o => o.trim()).map(o => ({
      poll_id: poll.id,
      option_text: o.trim(),
    }));

    await supabase.from("poll_options").insert(optionRows);
    toast({ title: "투표가 생성되었습니다!" });
    navigate(`/polls/${poll.id}`);
  };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Vote className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">투표 만들기</h1>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">제목</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="투표 제목을 입력하세요" />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">설명 (선택)</label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="투표에 대한 설명..." rows={3} />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">선택지</label>
            <div className="space-y-2">
              {options.map((o, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={o} onChange={e => updateOption(i, e.target.value)} placeholder={`선택지 ${i + 1}`} />
                  {options.length > 2 && (
                    <Button variant="ghost" size="icon" onClick={() => removeOption(i)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addOption} className="mt-1">
                <Plus className="h-4 w-4 mr-1" /> 선택지 추가
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">마감일</label>
            <Input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">투표 대상 동</label>
            <div className="flex flex-wrap gap-2">
              <button onClick={toggleAll}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
                  selectedBuildings.length === BUILDINGS.length
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border hover:bg-muted"
                }`}>
                전체
              </button>
              {BUILDINGS.map(b => (
                <button key={b} onClick={() => toggleBuilding(b)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
                    selectedBuildings.includes(b)
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "bg-card text-muted-foreground border-border hover:bg-muted"
                  }`}>
                  {b}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={submitting} className="w-full">
            {submitting ? "생성 중..." : "투표 생성하기"}
          </Button>
        </div>
      </motion.div>
    </AppLayout>
  );
}
