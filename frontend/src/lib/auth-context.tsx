import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from "react";
import api from "./api";

export type UserRole = "donor" | "hospital" | "admin" | null;

interface AuthState {
  role: UserRole;
  profile: any | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<{ success: boolean; role: UserRole; profile: any }>;
  logout: () => void;
  setSession: (token: string, role: UserRole, profile: any) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  role: null,
  profile: null,
  token: null,
  loading: true,
  login: async () => ({ success: false, role: null, profile: null }),
  logout: () => {},
  setSession: () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const setSession = useCallback((newToken: string, newRole: UserRole, newProfile: any) => {
    localStorage.setItem("redpint_token", newToken);
    if (newRole) localStorage.setItem("redpint_role", newRole);
    setToken(newToken);
    setRole(newRole);
    setProfile(newProfile);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("redpint_token");
    localStorage.removeItem("redpint_role");
    setToken(null);
    setRole(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const storedToken = localStorage.getItem("redpint_token");
    if (!storedToken) {
      setRole(null);
      setProfile(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get("/auth/me");
      if (res.data?.success) {
        setToken(storedToken);
        setRole(res.data.role);
        setProfile(res.data.profile);
      } else {
        logout();
      }
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  const login = async (email: string, password: string, selectedRole?: UserRole) => {
    const res = await api.post("/auth/login", {
      email,
      password,
      role: selectedRole || undefined,
    });

    if (res.data?.success) {
      const { token: receivedToken, role: receivedRole, profile: receivedProfile } = res.data;
      setSession(receivedToken, receivedRole, receivedProfile);
      return { success: true, role: receivedRole, profile: receivedProfile };
    }

    throw new Error(res.data?.message || "Failed to log in.");
  };

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        profile,
        loading,
        login,
        logout,
        setSession,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
