import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, ArrowLeft, Mail, Lock, User, Home } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [unitInfo, setUnitInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !displayName) return;

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName, unit_info: unitInfo },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      toast({ title: "가입 실패", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "가입 완료!", description: "이메일을 확인해 주세요." });
      navigate("/login");
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
          <p className="text-sm text-muted-foreground mt-1">입주민 회원가입</p>
        </div>

        <form onSubmit={handleSignup} className="rounded-2xl border bg-card p-6 shadow-card space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">이름 (닉네임)</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="홍길동" className="pl-10" required />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">동/호수</label>
            <div className="relative">
              <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={unitInfo} onChange={e => setUnitInfo(e.target.value)} placeholder="101동 1502호" className="pl-10" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">이메일</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" className="pl-10" required />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">비밀번호</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="6자 이상" className="pl-10" required minLength={6} />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "가입 중..." : "회원가입"}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            이미 계정이 있으신가요?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">로그인</Link>
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
