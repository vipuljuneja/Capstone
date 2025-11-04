import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  GoogleAuthProvider,
  reauthenticateWithCredential,
  signInWithCredential,
} from 'firebase/auth';
import { auth } from '../firebase';
import { createUserInBackend, getUserByAuthUid } from './api';
import { GOOGLE_WEB_CLIENT_ID as ENV_WEB, GOOGLE_IOS_CLIENT_ID as ENV_IOS } from '@env';

type EnsureBackendOptions = {
  ensureBackendUser?: boolean;
};

const FALLBACK_WEB =
  '610152466843-h126n2v1s8bt74g9rmhtgdljovuqr8a7.apps.googleusercontent.com';
const FALLBACK_IOS =
  '610152466843-h5jabjfhjn3gk1m7bsalbht640prtark.apps.googleusercontent.com';

let googleConfigured = false;

const resolveClientIds = () => {
  const webClientId = (ENV_WEB as unknown as string) || FALLBACK_WEB;
  const iosClientId = (ENV_IOS as unknown as string) || FALLBACK_IOS;
  return { webClientId, iosClientId };
};

export const configureGoogleSignin = () => {
  if (googleConfigured) {
    return;
  }

  const { webClientId, iosClientId } = resolveClientIds();

  // Debug aid: verify IDs at runtime
  // eslint-disable-next-line no-console
  console.log('Google SignIn IDs → WEB:', webClientId, 'IOS:', iosClientId);

  GoogleSignin.configure({
    webClientId,
    iosClientId,
    offlineAccess: true,
  });
  googleConfigured = true;
};

const ensureIdToken = async (idToken?: string | null) => {
  let token = idToken || null;

  if (!token) {
    // Some devices fail to return idToken on signIn; fetch directly from token storage.
    const tokens = await GoogleSignin.getTokens();
    token = tokens?.idToken || null;
  }

  if (!token) {
    throw new Error(
      'Google sign-in did not return an idToken. Ensure GOOGLE_WEB_CLIENT_ID is set to your OAuth 2.0 Web client ID and rebuild the app.'
    );
  }

  return token;
};

export async function signInWithGoogle(
  options: EnsureBackendOptions = { ensureBackendUser: true },
) {
  configureGoogleSignin();

  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const { idToken: signInIdToken, user } = await GoogleSignin.signIn();
  const idToken = await ensureIdToken(signInIdToken);

  const credential = GoogleAuthProvider.credential(idToken);
  const { user: firebaseUser } = await signInWithCredential(auth, credential);

  if (options.ensureBackendUser) {
    try {
      await getUserByAuthUid(firebaseUser.uid);
    } catch (e: any) {
      const message = e?.message || '';
      const notFound =
        message.includes('not found') || message.includes('404');
      if (notFound) {
        const nameFromGoogle = user?.name || firebaseUser.displayName || 'User';
        const email = firebaseUser.email || '';
        await createUserInBackend({
          authUid: firebaseUser.uid,
          email,
          name: nameFromGoogle,
        });
      }
    }
  }

  return firebaseUser;
}

export const reauthenticateCurrentUserWithGoogle = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No authenticated user found.');
  }

  configureGoogleSignin();
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  let googleUser;
  try {
    googleUser = await GoogleSignin.signInSilently();
  } catch (error) {
    googleUser = await GoogleSignin.signIn();
  }

  const idToken = await ensureIdToken(googleUser?.idToken);
  const credential = GoogleAuthProvider.credential(idToken);
  await reauthenticateWithCredential(user, credential);

  return { credential, googleUser };
};
