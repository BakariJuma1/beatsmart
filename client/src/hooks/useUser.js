import { useState, useEffect, useCallback } from "react";

export const useUser = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setUser({ name: "Artist", email: "artist@example.com" });
    }
  }, []);

  const login = useCallback(() => {
    localStorage.setItem("token", "mock-token");
    setUser({ name: "Artist", email: "artist@example.com" });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  return { user, login, logout };
};