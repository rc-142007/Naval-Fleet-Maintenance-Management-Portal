
import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem("nfmmp_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(
    () => sessionStorage.getItem("nfmmp_token") || null
  );

  const login = (userData, jwtToken) => {
    sessionStorage.setItem("nfmmp_user", JSON.stringify(userData));
    sessionStorage.setItem("nfmmp_token", jwtToken);

    setUser(userData);
    setToken(jwtToken);
  };

  const logout = () => {
    sessionStorage.removeItem("nfmmp_user");
    sessionStorage.removeItem("nfmmp_token");

    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
