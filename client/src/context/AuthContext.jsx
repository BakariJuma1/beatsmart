import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        try {
          const res = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/auth/verify`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true,
            }
          );
          setUser(res.data.user);
          setRole(res.data.user.role);
        } catch (err) {
          console.error("Verification failed:", err);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/auth/logout`,
      {},
      { withCredentials: true }
    );
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
