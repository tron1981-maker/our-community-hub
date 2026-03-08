import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, ArrowLeft, Mail, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const DEMO_EMAIL = "1234";
  const DEMO_PASSWORD = "1234";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Demo login bypass
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      toast({ title: "데모 로그인 성공", description: "게스트로 접속합니다." });
      navigate("/");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({ title: "로그인 실패", description: error.message, variant: "destructive" });
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: roleData } = await supabase.rpc("get_user_role", { _user_id: user.id });
        if (roleData === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }
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
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <Building2 className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">우리단지 라운지</h1>
          <p className="text-sm text-muted-foreground mt-1">입주민 로그인</p>
        </div>

        <form onSubmit={handleLogin} className="rounded-2xl border bg-card p-6 shadow-card space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">이메일</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" className="pl-10" required />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">비밀번호</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="비밀번호 입력" className="pl-10" required />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "로그인 중..." : "로그인"}
          </Button>

          <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/50 p-3 text-center text-xs text-muted-foreground">
            <p className="font-medium mb-1">테스트 계정</p>
            <p>이메일: <span className="font-mono font-semibold text-foreground">1234</span> / 비밀번호: <span className="font-mono font-semibold text-foreground">1234</span></p>
          </div>

          <div className="flex justify-between text-sm">
            <Link to="/signup" className="text-primary hover:underline">회원가입</Link>
            <Link to="/admin/login" className="text-muted-foreground hover:text-foreground">관리자 로그인 →</Link>
          </div>
        </form>

        <div className="mt-4 text-center">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> 홈으로 돌아가기
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
