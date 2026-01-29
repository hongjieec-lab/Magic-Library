
import React, { useState } from 'react';
import { User } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
  currentUser: User | null;
  onLogout: () => void;
}

const UserPortal: React.FC<Props> = ({ isOpen, onClose, onLogin, currentUser, onLogout }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const users = JSON.parse(localStorage.getItem('magic_library_users') || '{}');
    
    if (isRegistering) {
      if (users[email]) {
        setError('该邮箱已注册');
        return;
      }
      const newUser: User = { email, favorites: [], folders: [] };
      users[email] = { ...newUser, password };
      localStorage.setItem('magic_library_users', JSON.stringify(users));
      onLogin(newUser);
      onClose();
    } else {
      const user = users[email];
      if (user && user.password === password) {
        onLogin({ email: user.email, favorites: user.favorites, folders: user.folders });
        onClose();
      } else {
        setError('邮箱或密码不正确');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-indigo-950/40 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {currentUser ? (
          <div className="p-10 text-center">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600 text-3xl">
              <i className="fa-solid fa-user-check"></i>
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">已登录</h2>
            <p className="text-gray-500 mb-8">{currentUser.email}</p>
            <button 
              onClick={onLogout}
              className="w-full py-4 bg-red-50 text-red-600 font-black rounded-2xl hover:bg-red-100 transition-all active:scale-95"
            >
              退出当前账号
            </button>
          </div>
        ) : (
          <>
            <div className="bg-indigo-600 p-8 text-white text-center">
              <h2 className="text-2xl font-black">{isRegistering ? '开启魔法之旅' : '欢迎回来'}</h2>
              <p className="text-indigo-100 text-xs mt-1">登录后同步您的个人书架</p>
            </div>
            
            <form onSubmit={handleAuth} className="p-8 space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">电子邮箱</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">密码</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                  required
                />
              </div>
              
              {error && <p className="text-red-500 text-xs font-bold px-1"><i className="fa-solid fa-circle-exclamation mr-1"></i> {error}</p>}
              
              <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
                {isRegistering ? '立即注册' : '登录账号'}
              </button>
              
              <div className="text-center pt-2">
                <button 
                  type="button"
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="text-indigo-600 text-xs font-bold hover:underline"
                >
                  {isRegistering ? '已有账号？点此登录' : '没有账号？点此注册'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default UserPortal;
