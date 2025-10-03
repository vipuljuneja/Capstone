import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, initializeAuth } from 'firebase/auth';
import {
  FIREBASE_API_KEY,
  FIREBASE_APP_ID,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_MEASUREMENT_ID,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
} from '@env';

type AsyncStorageLike = {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
};

type ReactNativePersistence = {
  type: 'LOCAL';
  _isAvailable(): Promise<boolean>;
  _set(key: string, value: unknown): Promise<void>;
  _get<T>(key: string): Promise<T | null>;
  _remove(key: string): Promise<void>;
  _addListener(key: string, listener: unknown): void;
  _removeListener(key: string, listener: unknown): void;
};

type ReactNativePersistenceClass = {
  new (): ReactNativePersistence;
  type: 'LOCAL';
};

const STORAGE_AVAILABLE_KEY = '__firebaseRNStorageAvailable';

const getReactNativePersistence = (
  storage: AsyncStorageLike,
): ReactNativePersistenceClass => {
  return class ReactNativeAsyncStoragePersistence
    implements ReactNativePersistence
  {
    static type: 'LOCAL' = 'LOCAL';

    readonly type: 'LOCAL' = 'LOCAL';

    async _isAvailable(): Promise<boolean> {
      try {
        if (!storage) {
          return false;
        }

        await storage.setItem(STORAGE_AVAILABLE_KEY, '1');
        await storage.removeItem(STORAGE_AVAILABLE_KEY);
        return true;
      } catch {
        return false;
      }
    }

    _set(key: string, value: unknown): Promise<void> {
      return storage.setItem(key, JSON.stringify(value));
    }

    async _get<T>(key: string): Promise<T | null> {
      const json = await storage.getItem(key);
      return json ? (JSON.parse(json) as T) : null;
    }

    _remove(key: string): Promise<void> {
      return storage.removeItem(key);
    }

    // Persistence listeners are not supported for AsyncStorage.
    _addListener(_key: string, _listener: unknown): void {}

    _removeListener(_key: string, _listener: unknown): void {}
  };
};

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

declare global {
  // eslint-disable-next-line no-var
  var firebaseAuth: Auth | undefined;
}

const auth =
  globalThis.firebaseAuth ??
  initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage as AsyncStorageLike),
  });

globalThis.firebaseAuth = auth;

export { app, auth };
