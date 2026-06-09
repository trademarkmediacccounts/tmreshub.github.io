import { createContext, useContext } from "react";
import { useClerk, useUser } from "@clerk/react";

interface AuthContextType {
  user: { id: string; email?: string } | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const { signOut: clerkSignOut } = useClerk();

  const signOut = async () => {
    await clerkSignOut();
  };

  const adaptedUser = user ? { id: user.id, email: user.primaryEmailAddress?.emailAddress } : null;

  return (
    <AuthContext.Provider value={{ user: adaptedUser, loading: !isLoaded, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
