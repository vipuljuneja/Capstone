import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../firebase';
import { createUserInBackend, getUserByAuthUid } from './api';
import { GOOGLE_WEB_CLIENT_ID as ENV_WEB, GOOGLE_IOS_CLIENT_ID as ENV_IOS } from '@env';

type EnsureBackendOptions = {
  ensureBackendUser?: boolean;
};

export async function signInWithGoogle(
  options: EnsureBackendOptions = { ensureBackendUser: true },
) {
  // Fallbacks in case envs are not loaded at runtime
  const FALLBACK_WEB =
    '610152466843-h126n2v1s8bt74g9rmhtgdljovuqr8a7.apps.googleusercontent.com';
  const FALLBACK_IOS =
    '610152466843-h5jabjfhjn3gk1m7bsalbht640prtark.apps.googleusercontent.com';

  const webClientId = (ENV_WEB as unknown as string) || FALLBACK_WEB;
  const iosClientId = (ENV_IOS as unknown as string) || FALLBACK_IOS;

  // Debug aid: verify IDs at runtime
  // eslint-disable-next-line no-console
  console.log('Google SignIn IDs → WEB:', webClientId, 'IOS:', iosClientId);

  GoogleSignin.configure({
    webClientId,
    iosClientId,
    offlineAccess: true,
  });

  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const { idToken: signInIdToken, user } = await GoogleSignin.signIn();
  let idToken: string | null = signInIdToken || null;

  if (!idToken) {
    // Some devices fail to return idToken on signIn; fetch directly from token storage.
    const tokens = await GoogleSignin.getTokens();
    idToken = tokens?.idToken || null;
  }

  if (!idToken) {
    throw new Error(
      'Google sign-in did not return an idToken. Ensure GOOGLE_WEB_CLIENT_ID is set to your OAuth 2.0 Web client ID and rebuild the app.'
    );
  }

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
