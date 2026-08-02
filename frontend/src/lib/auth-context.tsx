import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, signOut, type User as FirebaseUser } from "firebase/auth";
import { auth } from "./firebase";
import api from "./api";

export type UserRole = "donor" | "hospital" | null;

interface AuthState {
  user: FirebaseUser | null;
  role: UserRole;
  profile: any | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  role: null,
  profile: null,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (!firebaseUser) {
        setRole(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      // Resolve role by probing backend endpoints
      try {
        const donorRes = await api.get("/donors/me/profile");
        if (donorRes.data.donor) {
          setRole("donor");
          setProfile(donorRes.data.donor);
          setLoading(false);
          return;
        }
      } catch {
        // Not a donor — try hospital
      }

      try {
        const hospitalRes = await api.get("/hospitals/me/profile");
        if (hospitalRes.data.hospital) {
          setRole("hospital");
          setProfile(hospitalRes.data.hospital);
          setLoading(false);
          return;
        }
      } catch {
        // Not a hospital either — newly registered Firebase user not yet in DB
      }

      // Firebase user exists but no backend profile yet (mid-registration)
      setRole(null);
      setProfile(null);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setRole(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, profile, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
