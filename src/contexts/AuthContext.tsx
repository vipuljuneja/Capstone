// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { BackendUser, getUserByAuthUid } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  // mongoUser: BackendUser | null;
  mongoUser: any | null;
  refreshMongoUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  mongoUser: null,
  refreshMongoUser: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // const [mongoUser, setMongoUser] = useState<BackendUser | null>(null);
  const [mongoUser, setMongoUser] = useState<any | null>(null);

  const fetchMongoUser = async (firebaseUser: User, retries = 3) => {
    try {
      console.log('🔍 Fetching MongoDB user for:', firebaseUser.uid);

      // getUserByAuthUid already returns the BackendUser directly (not wrapped in envelope)
      const userData = await getUserByAuthUid(firebaseUser.uid);

      console.log('✅ MongoDB user found:', userData.name);
      setMongoUser(userData);
    } catch (error: any) {
      // console.warn(`❌ Failed to fetch MongoDB user (attempt ${4 - retries}/3):`, error.message);

      // If user not found and we have retries left, wait and try again
      // This handles the race condition during signup
      if (
        retries > 0 &&
        (error.message?.includes('not found') ||
          error.message?.includes('404') ||
          error.message?.includes('Failed to load user profile'))
      ) {
        console.log(`⏳ Retrying in 1 second... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchMongoUser(firebaseUser, retries - 1);
      }

      // After all retries, log but don't crash
      // console.error('❌ Failed to load MongoDB user after all retries');
      setMongoUser(null);
    }
  };

  const refreshMongoUser = async () => {
    if (user) {
      await fetchMongoUser(user);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async nextUser => {
      console.log(
        '🔐 Auth state changed:',
        nextUser ? nextUser.email : 'Signed out',
      );
      setLoading(true);
      setUser(nextUser);

      if (nextUser) {
        // User signed in - fetch their MongoDB profile with retry logic
        // Call asynchronously without blocking to prevent crashes during login/signup
        // Add a small delay to handle race conditions during signup
        setTimeout(() => {
          fetchMongoUser(nextUser).catch(error => {
            // Silently handle errors - don't crash the app
            // The HomeScreen will retry when it loads
            console.log('⚠️ Failed to fetch MongoDB user in auth callback:', error.message);
          });
        }, 500);
      } else {
        // User signed out
        setMongoUser(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, mongoUser, refreshMongoUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
