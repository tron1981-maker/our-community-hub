import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Shield, Users, Megaphone, FileText, LogOut, Home,
  UserCheck, UserX, ChevronRight, BarChart3
} from "lucide-react";
import { motion } from "framer-motion";

interface UserRow {
  user_id: string;
  display_name: string;
  unit_info: string;
  role: string;
}

export default function AdminDashboard() {
  const { user, signOut, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [stats, setStats] = useState({ total: 0, verified: 0, unverified: 0 });

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/admin/login");
    }
  }, [loading, isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("user_id, display_name, unit_info");

    if (data) {
      const usersWithRoles: UserRow[] = await Promise.all(
        data.map(async (p) => {
          const { data: role } = await supabase.rpc("get_user_role", { _user_id: p.user_id });
          return { ...p, role: role || "unverified" };
        })
      );
      setUsers(usersWithRoles);
      setStats({
        total: usersWithRoles.length,
        verified: usersWithRoles.filter(u => u.role !== "unverified").length,
        unverified: usersWithRoles.filter(u => u.role === "unverified").length,
      });
    }
  };

  const updateRole = async (userId: string, newRole: string) => {
    // Delete existing role and insert new one
    await supabase.from("user_roles").delete().eq("user_id", userId);
    await supabase.from("user_roles").insert({ user_id: userId, role: newRole });
    fetchUsers();
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">로딩 중...</p>
    </div>;
  }

  if (!isAdmin) return null;

  const roleLabel: Record<string, string> = {
    unverified: "미인증",
    resident: "입주민",
    representative: "동대표",
    admin: "관리자",
  };

  const roleBadgeClass: Record<string, string> = {
    unverified: "bg-muted text-muted-foreground",
    resident: "bg-primary/10 text-primary",
    representative: "bg-accent/10 text-accent",
    admin: "bg-destructive/10 text-destructive",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Admin header */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive">
              <Shield className="h-4 w-4 text-destructive-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">관리자 대시보드</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="ghost" size="sm"><Home className="h-4 w-4 mr-1" /> 주민 페이지</Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-1" /> 로그아웃
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "전체 회원", value: stats.total, icon: Users, color: "text-primary" },
            { label: "인증 완료", value: stats.verified, icon: UserCheck, color: "text-primary" },
            { label: "미인증", value: stats.unverified, icon: UserX, color: "text-accent" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-xl border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{s.value}</p>
                </div>
                <s.icon className={`h-8 w-8 ${s.color} opacity-60`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "공지 작성", icon: Megaphone, path: "/board/notice" },
            { label: "민원 확인", icon: FileText, path: "/board/complaint" },
            { label: "회원 관리", icon: Users, path: "#users" },
            { label: "통계", icon: BarChart3, path: "#stats" },
          ].map(a => (
            <Link key={a.label} to={a.path}
              className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 shadow-card hover:shadow-card-md transition-all hover:-translate-y-0.5">
              <a.icon className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium text-foreground">{a.label}</span>
            </Link>
          ))}
        </div>

        {/* User management */}
        <section id="users">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> 회원 관리
          </h2>
          <div className="rounded-xl border bg-card shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">이름</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">동/호수</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">등급</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.user_id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{u.display_name || "(미입력)"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{u.unit_info || "-"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${roleBadgeClass[u.role] || roleBadgeClass.unverified}`}>
                          {roleLabel[u.role] || "미인증"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <select
                          value={u.role}
                          onChange={e => updateRole(u.user_id, e.target.value)}
                          className="rounded-lg border bg-background px-2 py-1 text-xs text-foreground"
                        >
                          <option value="unverified">미인증</option>
                          <option value="resident">입주민</option>
                          <option value="representative">동대표</option>
                          <option value="admin">관리자</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                        가입된 회원이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
