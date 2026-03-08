import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { BUILDINGS } from "@/lib/buildings";
import { Button } from "@/components/ui/button";
import {
  Shield, Users, Home, LogOut, UserCheck, CheckCircle2,
  Search, ArrowLeft, BadgeCheck
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";

interface UserRow {
  user_id: string;
  display_name: string;
  unit_info: string;
  building_number: string;
  is_verified_resident: boolean;
  role: string;
}

export default function AdminMemberPage() {
  const { user, signOut, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [filterBuilding, setFilterBuilding] = useState("");
  const isDemoAdmin = sessionStorage.getItem("demo_admin") === "true";
  const hasAccess = isAdmin || isDemoAdmin;

  useEffect(() => {
    if (!loading && !hasAccess) navigate("/admin/login");
  }, [loading, hasAccess, navigate]);

  useEffect(() => {
    if (hasAccess) fetchUsers();
  }, [hasAccess]);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("user_id, display_name, unit_info, building_number, is_verified_resident");

    if (data) {
      const usersWithRoles: UserRow[] = await Promise.all(
        data.map(async (p: any) => {
          const { data: role } = await supabase.rpc("get_user_role", { _user_id: p.user_id });
          return { ...p, role: role || "unverified" };
        })
      );
      setUsers(usersWithRoles);
    }
  };

  const updateRole = async (userId: string, newRole: string) => {
    await supabase.from("user_roles").delete().eq("user_id", userId);
    await supabase.from("user_roles").insert({ user_id: userId, role: newRole as any });
    toast({ title: "등급 변경 완료" });
    fetchUsers();
  };

  const updateBuilding = async (userId: string, building: string) => {
    await supabase.from("profiles").update({ building_number: building }).eq("user_id", userId);
    toast({ title: "동 정보 변경 완료" });
    fetchUsers();
  };

  const toggleVerified = async (userId: string, current: boolean) => {
    await supabase.from("profiles").update({ is_verified_resident: !current }).eq("user_id", userId);
    toast({ title: !current ? "실거주자 인증 완료" : "실거주자 인증 해제" });
    fetchUsers();
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">로딩 중...</p>
    </div>;
  }
  if (!hasAccess) return null;

  const roleLabel: Record<string, string> = {
    unverified: "미인증", resident: "입주민", representative: "통장", admin: "관리자",
  };

  const roleBadgeClass: Record<string, string> = {
    unverified: "bg-muted text-muted-foreground",
    resident: "bg-primary/10 text-primary",
    representative: "bg-accent/10 text-accent",
    admin: "bg-destructive/10 text-destructive",
  };

  const filtered = users.filter(u => {
    const matchSearch = !search || u.display_name.includes(search) || u.unit_info?.includes(search);
    const matchBuilding = !filterBuilding || u.building_number === filterBuilding;
    return matchSearch && matchBuilding;
  });

  // Count 통장 per building
  const treasurerByBuilding: Record<string, string[]> = {};
  users.filter(u => u.role === "representative").forEach(u => {
    if (u.building_number) {
      if (!treasurerByBuilding[u.building_number]) treasurerByBuilding[u.building_number] = [];
      treasurerByBuilding[u.building_number].push(u.display_name || "(미입력)");
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link to="/admin">
              <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> 대시보드</Button>
            </Link>
            <span className="text-lg font-bold text-foreground">회원 관리</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/"><Button variant="ghost" size="sm"><Home className="h-4 w-4 mr-1" /> 홈</Button></Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {/* Building treasurer summary */}
        <section className="mb-6">
          <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" /> 동별 통장 현황
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {BUILDINGS.map(b => (
              <div key={b} className="rounded-xl border bg-card p-3 shadow-card text-center">
                <p className="text-sm font-bold text-foreground">{b}</p>
                {treasurerByBuilding[b] ? (
                  <p className="text-xs text-primary mt-1">{treasurerByBuilding[b].join(", ")}</p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">미지정</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="이름 또는 동/호수 검색..."
              className="w-full rounded-xl border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <select value={filterBuilding} onChange={e => setFilterBuilding(e.target.value)}
            className="rounded-xl border bg-card px-3 py-2.5 text-sm text-foreground">
            <option value="">전체 동</option>
            {BUILDINGS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        {/* Members table */}
        <div className="rounded-xl border bg-card shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">이름</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">동/호수</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">동</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">실거주</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">등급</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">관리</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.user_id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{u.display_name || "(미입력)"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.unit_info || "-"}</td>
                    <td className="px-4 py-3">
                      <select value={u.building_number || ""} onChange={e => updateBuilding(u.user_id, e.target.value)}
                        className="rounded-lg border bg-background px-2 py-1 text-xs text-foreground">
                        <option value="">미지정</option>
                        {BUILDINGS.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleVerified(u.user_id, u.is_verified_resident)}
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                          u.is_verified_resident
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}>
                        {u.is_verified_resident ? <><BadgeCheck className="h-3 w-3" /> 인증</> : "미인증"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${roleBadgeClass[u.role] || roleBadgeClass.unverified}`}>
                        {roleLabel[u.role] || "미인증"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <select value={u.role} onChange={e => updateRole(u.user_id, e.target.value)}
                        className="rounded-lg border bg-background px-2 py-1 text-xs text-foreground">
                        <option value="unverified">미인증</option>
                        <option value="resident">입주민</option>
                        <option value="representative">통장</option>
                        <option value="admin">관리자</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">회원이 없습니다.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
