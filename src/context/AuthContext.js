import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('cms_user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const data = await authService.login(username, password);
      
      if (data.length > 0) {
        const user = data[0];
        setCurrentUser(user);
        localStorage.setItem('cms_user', JSON.stringify(user));
        return { success: true, user };
      } else {
        return { success: false, message: 'Sai tài khoản hoặc mật khẩu!' };
      }
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      return { success: false, message: 'Không thể kết nối đến máy chủ!' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('cms_user');
  };

  const changePassword = async (userId, newPassword) => {
    try {
      await authService.changePassword(userId, newPassword);
      const updatedUser = { ...currentUser, password: newPassword };
      setCurrentUser(updatedUser);
      localStorage.setItem('cms_user', JSON.stringify(updatedUser));
      return { success: true };
    } catch (error) {
      console.error('Lỗi đổi mật khẩu:', error);
      return { success: false, message: error.message || 'Không thể đổi mật khẩu!' };
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, loading, login, logout, changePassword }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
