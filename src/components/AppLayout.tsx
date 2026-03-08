import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home, MessageSquare, ShoppingBag, Megaphone, FileText,
  Bell, Menu, X, ChevronRight, Building2, Settings, LogOut, User, Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserBadge } from "./UserBadge";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { path: "/", label: "홈", icon: Home },
  { path: "/board/notice", label: "공지사항", icon: Megaphone },
  { path: "/board/free", label: "자유게시판", icon: MessageSquare },
  { path: "/board/market", label: "장터", icon: ShoppingBag },
  { path: "/board/complaint", label: "민원/건의", icon: FileText },
];

const mockNotifications = [
  { id: 1, text: "내 글에 새 댓글이 달렸습니다.", time: "3분 전", unread: true },
  { id: 2, text: "관리사무소 긴급 공지가 등록되었습니다.", time: "1시간 전", unread: true },
  { id: 3, text: "장터에 관심 키워드 '자전거' 글이 올라왔습니다.", time: "2시간 전", unread: false },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, role, signOut, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Top header */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 hover:bg-muted lg:hidden">
              <Menu className="h-5 w-5 text-foreground" />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Building2 className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">우리단지 라운지</span>
            </Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)} className="relative rounded-lg p-2 hover:bg-muted">
                <Bell className="h-5 w-5 text-foreground" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent animate-pulse-dot" />
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    className="absolute right-0 top-12 w-80 rounded-xl border bg-card shadow-card-lg"
                  >
                    <div className="flex items-center justify-between border-b px-4 py-3">
                      <span className="text-sm font-semibold text-foreground">알림</span>
                      <span className="text-xs text-primary cursor-pointer hover:underline">모두 읽음</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {mockNotifications.map(n => (
                        <div key={n.id} className={cn("flex items-start gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors", n.unread && "bg-primary/5")}>
                          <div className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", n.unread ? "bg-primary" : "bg-transparent")} />
                          <div>
                            <p className="text-sm text-foreground">{n.text}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* User area */}
            <div className="hidden items-center gap-2 sm:flex">
              {user ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" className="rounded-lg p-2 hover:bg-muted" title="관리자">
                      <Shield className="h-4 w-4 text-destructive" />
                    </Link>
                  )}
                  <UserBadge level={role === "admin" ? 3 : role === "representative" ? 2 : role === "resident" ? 1 : 0} />
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <button onClick={signOut} className="rounded-lg p-2 hover:bg-muted" title="로그아웃">
                    <LogOut className="h-4 w-4 text-muted-foreground" />
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-1">
                  <Link to="/login" className="rounded-lg px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors">
                    로그인
                  </Link>
                  <Link to="/signup" className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                    회원가입
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 z-50 h-full w-72 border-r bg-card shadow-card-lg lg:hidden"
            >
              <div className="flex items-center justify-between border-b px-4 py-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                    <Building2 className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="font-bold text-foreground">우리단지 라운지</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-1 hover:bg-muted">
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
              <div className="px-3 py-4">
                <div className="mb-4 rounded-xl bg-muted/50 p-3">
                  {user ? (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{profile?.display_name || "사용자"}</p>
                          <p className="text-xs text-muted-foreground">{profile?.unit_info || "미인증"}</p>
                        </div>
                      </div>
                      <UserBadge level={role === "admin" ? 3 : role === "representative" ? 2 : role === "resident" ? 1 : 0} />
                    </>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">로그인이 필요합니다</p>
                      <Link to="/login" onClick={() => setSidebarOpen(false)}
                        className="block w-full rounded-lg bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground">
                        로그인
                      </Link>
                    </div>
                  )}
                </div>
                <nav className="space-y-1">
                  {navItems.map(item => {
                    const Icon = item.icon;
                    const active = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                          active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                        {active && <ChevronRight className="ml-auto h-4 w-4" />}
                      </Link>
                    );
                  })}
                </nav>
                <div className="mt-6 border-t pt-4 space-y-1">
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setSidebarOpen(false)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-destructive hover:bg-muted">
                      <Shield className="h-4 w-4" /> 관리자 대시보드
                    </Link>
                  )}
                  <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted">
                    <Settings className="h-4 w-4" /> 설정
                  </button>
                  {user ? (
                    <button onClick={() => { signOut(); setSidebarOpen(false); }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted">
                      <LogOut className="h-4 w-4" /> 로그아웃
                    </button>
                  ) : (
                    <Link to="/login" onClick={() => setSidebarOpen(false)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-primary hover:bg-muted">
                      <User className="h-4 w-4" /> 로그인
                    </Link>
                  )}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        {children}
      </main>
    </div>
  );
}
