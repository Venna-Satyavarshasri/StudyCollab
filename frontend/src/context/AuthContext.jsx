import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Created once — interceptor always reads the freshest token from localStorage
  const axiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
    });
    instance.interceptors.request.use((config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    return instance;
  }, []); // empty deps — only created once

  // Fetch profile helper
  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const { data } = await axiosInstance.get("/api/users/profile");
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        avatar: data.avatar,
      });
    } catch (err) {
      setUser(null);
      localStorage.removeItem("token");
    }
  };

  // On mount, fetch fresh profile if token present
  useEffect(() => {
    fetchProfile().finally(() => setLoading(false));
    // eslint-disable-next-line
  }, []);

  const login = async (credentials) => {
    const res = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/users/login`,
      credentials
    );
    localStorage.setItem("token", res.data.token);
    // Interceptor will pick up the new token automatically on next request
    await fetchProfile();
  };

  const signup = async (credentials) => {
    const res = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/users`,
      credentials
    );
    // No token returned — user must verify email before logging in
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    axiosInstance,
    setUser,
    fetchProfile,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};
