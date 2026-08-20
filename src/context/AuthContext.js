import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('cms_user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch(`http://localhost:5000/users?username=${username}&password=${password}`);
      const data = await response.json();
      
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
      const response = await fetch(`http://localhost:5000/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: newPassword }),
      });
      if (response.ok) {
        const updatedUser = { ...currentUser, password: newPassword };
        setCurrentUser(updatedUser);
        localStorage.setItem('cms_user', JSON.stringify(updatedUser));
        return { success: true };
      }
      return { success: false, message: 'Không thể đổi mật khẩu!' };
    } catch (error) {
      console.error('Lỗi đổi mật khẩu:', error);
      return { success: false, message: 'Không thể kết nối đến máy chủ!' };
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, loading, login, logout, changePassword }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
