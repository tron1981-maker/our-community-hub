import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, ArrowLeft, Mail, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (email === "1234" && password === "1234") {
      toast({ title: "데모 관리자 로그인 성공", description: "관리자로 접속합니다." });
      navigate("/admin");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({ title: "로그인 실패", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: roleData } = await supabase.rpc("get_user_role", { _user_id: user.id });
      if (roleData !== "admin") {
        await supabase.auth.signOut();
        toast({ title: "접근 거부", description: "관리자 권한이 없는 계정입니다.", variant: "destructive" });
        setLoading(false);
        return;
      }
      navigate("/admin");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive">
            <Shield className="h-7 w-7 text-destructive-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">관리자 로그인</h1>
          <p className="text-sm text-muted-foreground mt-1">관리사무소 전용</p>
        </div>

        <form onSubmit={handleLogin} className="rounded-2xl border border-destructive/20 bg-card p-6 shadow-card space-y-4">
          <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-3">
            <p className="text-xs text-destructive font-medium">⚠️ 이 페이지는 관리사무소 전용입니다. 일반 주민은 <Link to="/login" className="underline">주민 로그인</Link>을 이용해 주세요.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">관리자 이메일</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@complex.co.kr" className="pl-10" required />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">비밀번호</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="비밀번호 입력" className="pl-10" required />
            </div>
          </div>

          <Button type="submit" variant="destructive" className="w-full" disabled={loading}>
            {loading ? "인증 중..." : "관리자 로그인"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Link to="/login" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> 주민 로그인으로
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
