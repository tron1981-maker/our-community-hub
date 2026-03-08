import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

type AppRole = "unverified" | "resident" | "representative" | "admin";

interface Profile {
  display_name: string;
  unit_info: string;
  avatar_url: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: AppRole;
  loading: boolean;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  role: "unverified",
  loading: true,
  signOut: async () => {},
  isAdmin: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole>("unverified");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch profile and role with setTimeout to avoid deadlock
          setTimeout(async () => {
            const [profileRes, roleRes] = await Promise.all([
              supabase.from("profiles").select("display_name, unit_info, avatar_url").eq("user_id", session.user.id).single(),
              supabase.rpc("get_user_role", { _user_id: session.user.id }),
            ]);
            if (profileRes.data) setProfile(profileRes.data);
            if (roleRes.data) setRole(roleRes.data as AppRole);
            setLoading(false);
          }, 0);
        } else {
          setProfile(null);
          setRole("unverified");
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, role, loading, signOut, isAdmin: role === "admin" }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
