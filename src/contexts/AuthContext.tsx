// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { BackendUser, getUserByAuthUid } from '../services/api';

interface AuthContextType {
  firebaseUser: User | null;
  userProfile: BackendUser | null;
  loading: boolean;
  profileLoading: boolean;
  profileError: string | null;
  refreshUserProfile: () => Promise<BackendUser | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<BackendUser | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const fetchUserProfile = useCallback(async (uid: string) => {
    const profile = await getUserByAuthUid(uid);
    return profile;
  }, []);

  const refreshUserProfile = useCallback(async () => {
    if (!firebaseUser) {
      return null;
    }

    setProfileLoading(true);
    setProfileError(null);

    try {
      const profile = await fetchUserProfile(firebaseUser.uid);
      setUserProfile(profile);
      return profile;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to refresh profile.';
      console.error('❌ Failed to refresh user profile:', message);
      setUserProfile(null);
      setProfileError(message);
      return null;
    } finally {
      setProfileLoading(false);
    }
  }, [firebaseUser, fetchUserProfile]);

  useEffect(() => {
    let isActive = true;

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      if (!isActive) return;

      setFirebaseUser(nextUser);

      if (!nextUser) {
        setUserProfile(null);
        setProfileError(null);
        setProfileLoading(false);
        setInitializing(false);
        return;
      }

      setProfileLoading(true);
      setProfileError(null);

      fetchUserProfile(nextUser.uid)
        .then((profile) => {
          if (!isActive) return;
          setUserProfile(profile);
        })
        .catch((error) => {
          if (!isActive) return;
          const message =
            error instanceof Error
              ? error.message
              : 'Unable to load profile.';
          console.error('❌ Failed to load user profile:', message);
          setUserProfile(null);
          setProfileError(message);
        })
        .finally(() => {
          if (!isActive) return;
          setProfileLoading(false);
          setInitializing(false);
        });
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [fetchUserProfile]);

  const loading = initializing || profileLoading;

  const contextValue = useMemo(
    () => ({
      firebaseUser,
      userProfile,
      loading,
      profileLoading,
      profileError,
      refreshUserProfile
    }),
    [
      firebaseUser,
      userProfile,
      loading,
      profileLoading,
      profileError,
      refreshUserProfile
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
