import { cn } from "@/lib/utils";
import { Shield, ShieldCheck, Crown, UserCheck } from "lucide-react";

export type UserLevel = 0 | 1 | 2 | 3;

const levelConfig: Record<UserLevel, { label: string; icon: typeof Shield; className: string }> = {
  0: { label: "미인증", icon: Shield, className: "bg-badge-unverified/10 text-badge-unverified border-badge-unverified/20" },
  1: { label: "주민", icon: UserCheck, className: "bg-badge-resident/10 text-badge-resident border-badge-resident/20" },
  2: { label: "동대표", icon: ShieldCheck, className: "bg-badge-manager/10 text-badge-manager border-badge-manager/20" },
  3: { label: "관리자", icon: Crown, className: "bg-badge-admin/10 text-badge-admin border-badge-admin/20" },
};

interface UserBadgeProps {
  level: UserLevel;
  className?: string;
}

export function UserBadge({ level, className }: UserBadgeProps) {
  const config = levelConfig[level];
  const Icon = config.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium", config.className, className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

export function AuthorBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 text-xs font-medium">
      작성자
    </span>
  );
}
