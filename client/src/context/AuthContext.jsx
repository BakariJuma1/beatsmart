import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper function to map Firebase errors to friendly messages
  const getFriendlyMessage = (error) => {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "This email is already registered. Try logging in.";
      case "auth/invalid-email":
        return "The email address is not valid.";
      case "auth/user-not-found":
        return "No account found with this email.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/popup-closed-by-user":
        return "The login popup was closed before completing login.";
      case "auth/too-many-requests":
        return "Too many attempts. Please try again later.";
      default:
        return error.message || "An unexpected error occurred. Please try again.";
    }
  };

  const fetchUserData = async (firebaseUser) => {
    if (!firebaseUser) return;

    try {
      const token = await firebaseUser.getIdToken();
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/auth/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      const userData = res.data;
      setUser(userData);
      setRole(userData.role_display || userData.role || "artist");
    } catch (error) {
      console.error(
        "Failed to fetch user data:",
        error.response?.data || error.message
      );
    }
  };

  const signup = async (email, password, fullName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // Update display name
      await updateProfile(firebaseUser, { displayName: fullName });

      await fetchUserData(firebaseUser);

      return { success: true, user: firebaseUser };
    } catch (error) {
      console.error("Signup failed:", error);
      return { success: false, message: getFriendlyMessage(error) };
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      await fetchUserData(firebaseUser);
      return { success: true, user: firebaseUser };
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, message: getFriendlyMessage(error) };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      await fetchUserData(firebaseUser);
      return { success: true, user: firebaseUser };
    } catch (error) {
      console.error("Google login failed:", error);
      return { success: false, message: getFriendlyMessage(error) };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/logout`,
        {},
        { withCredentials: true }
      );
      setUser(null);
      setRole(null);
      return { success: true };
    } catch (error) {
      console.error("Logout failed:", error);
      return { success: false, message: getFriendlyMessage(error) };
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email, {
        url: "http://localhost:5173/login",
      });
      return {
        success: true,
        message: "Check your inbox for the password reset link.",
      };
    } catch (error) {
      console.error("Password reset failed:", error);
      return { success: false, message: getFriendlyMessage(error) };
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        fetchUserData(firebaseUser);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        signup,
        login,
        loginWithGoogle,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
