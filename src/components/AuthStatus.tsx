'use client';

import { useState, useEffect } from 'react';
import { auth, GoogleAuthProvider, signInWithPopup, signOut, User, onAuthStateChanged } from '@/lib/firebase';
import { CloudSync } from '@/lib/cloud-sync';
import { Cloud, CloudOff, LogIn, LogOut, User as UserIcon } from 'lucide-react';

export function AuthStatus() {
  const [user, setUser] = useState<User | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Initial sync on login
        CloudSync.syncDown().then(() => CloudSync.syncUp());
      }
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Login failed', err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Network Status */}
      <div 
        className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full transition-colors"
        style={{ 
          background: isOnline ? 'var(--color-success-light)' : 'var(--color-error-light)',
          color: isOnline ? 'var(--color-success)' : 'var(--color-error)',
        }}
        title={isOnline ? 'Online (Đang đồng bộ)' : 'Offline (Đã ngắt kết nối)'}
      >
        {isOnline ? <Cloud size={14} /> : <CloudOff size={14} />}
      </div>

      {/* Auth State */}
      {user ? (
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 px-2 py-1 bg-surface rounded-full border border-border">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-5 h-5 rounded-full" />
            ) : (
              <UserIcon size={14} className="text-text-muted" />
            )}
            <span className="text-xs font-medium text-text-primary max-w-[80px] truncate">
              {user.displayName || user.email}
            </span>
          </div>
          <button 
            onClick={handleLogout}
            className="btn-icon text-error hover:bg-error-light hover:text-error"
            title="Đăng xuất"
          >
            <LogOut size={16} />
          </button>
        </div>
      ) : (
        <button 
          onClick={handleLogin}
          className="btn-primary flex items-center gap-1 px-3 py-1.5 text-xs"
          title="Đăng nhập để đồng bộ đám mây"
        >
          <LogIn size={14} />
          <span className="hidden sm:inline">Đăng nhập</span>
        </button>
      )}
    </div>
  );
}
