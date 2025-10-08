import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Tts from 'react-native-tts';
import LevelsScreen from './src/components/LevelsScreen'

import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import AvatarGenerate from './src/components/AvatarGenerate';
import TTSBall from './src/components/TTSBallAnimation'
import { auth } from './src/firebase';
  const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, nextUser => {
      setUser(nextUser);
      setInitializing(false);
    });

    return unsubscribe;
  }, []);
  

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {initializing ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" />
          </View>
        ) : user ? (
          <SignedIn user={user} />
        ) : (
          <AuthForm />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function AuthForm(): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSignUp = mode === 'signUp';

  const canSubmit = useMemo(() => {
    if (email.trim() === '' || password === '') {
      return false;
    }

    if (isSignUp) {
      return confirmPassword !== '' && password === confirmPassword;
    }

    return true;
  }, [email, password, confirmPassword, isSignUp]);

  const resetErrorAndToggleMode = () => {
    setMode(current => (current === 'signIn' ? 'signUp' : 'signIn'));
    setError(null);
    setConfirmPassword('');
  };

  const handleSubmit = async () => {
    if (!canSubmit || submitting) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (err) {
      const fallbackMessage = isSignUp
        ? 'Unable to sign up. Please try again later.'
        : 'Unable to sign in. Please try again later.';
      const message =
        err instanceof Error
          ? err.message
          : fallbackMessage;
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const heading = isSignUp ? 'Create an account' : 'Welcome back';
  const subheading = isSignUp
    ? 'Sign up to get started'
    : 'Sign in to continue';
  const ctaText = submitting
    ? undefined
    : isSignUp
      ? 'Create Account'
      : 'Sign In';

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{heading}</Text>
        <Text style={styles.subtitle}>{subheading}</Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          placeholder="Email"
          style={styles.input}
          editable={!submitting}
        />

        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          style={styles.input}
          editable={!submitting}
        />

        {isSignUp ? (
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm password"
            secureTextEntry
            style={styles.input}
            editable={!submitting}
          />
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!canSubmit || submitting}
          style={[
            styles.button,
            (!canSubmit || submitting) && styles.buttonDisabled,
          ]}
        >
          {submitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>{ctaText}</Text>
          )}
        </TouchableOpacity>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleText}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </Text>
          <TouchableOpacity
            onPress={resetErrorAndToggleMode}
            disabled={submitting}
          >
            <Text style={styles.toggleLink}>
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function Screen({children}) {
  return (
    <View
      style={{
        flex: 1,
        
        justifyContent: "center",
        paddingHorizontal: 0,
        width: "100%",          
        alignItems: "stretch",
        
      }}
    >
     
        
      {children}
    </View>
  );
}

function Level1() {
  return (
    <Screen>
      <TTSBall />
    </Screen>
  );
}

function Level2() {
  return (
    <Screen>
      <AvatarGenerate />
    </Screen>
  );
}

function Level3() {
  return (
    <Screen>
      <AvatarGenerate />
    </Screen>
  );
}


function SignedIn({ user }: { user: User }): React.JSX.Element {
  const [signingOut, setSigningOut] = useState(false);
  const [showAvatar, setShowAvatar] = useState(false);
  const [showTTSBall, setShowTTSBall] = useState(false);
// if (showAvatar) {
//     return <LevelsScreen />;
//   }
//   if (showTTSBall) {
  
   
//   return <TTSBall />;
//   }
  const handleSignOut = async () => {
    if (signingOut) {
      return;
    }

    

    setSigningOut(true);
    try {
      await signOut(auth);
    } finally {
      setSigningOut(false);
    }
  };

  // return (
  //   <View style={styles.content}>
  //     <Text style={styles.title}>You are signed in</Text>
  //     <Text style={styles.subtitle}>{user.email}</Text>


  //     <TouchableOpacity
  //       onPress={handleSignOut}
  //       style={styles.button}
  //       disabled={signingOut}
  //     >
  //       {signingOut ? (
  //         <ActivityIndicator color="#ffffff" />
  //       ) : (
  //         <Text style={styles.buttonText}>Log Out</Text>
  //       )}
  //     </TouchableOpacity>
  //     <TouchableOpacity
  //       onPress={() => setShowAvatar(true)} 
  //       style={styles.button}
        
  //     >
  //       {signingOut ? (
  //         <ActivityIndicator color="#ffffff" />
  //       ) : (
  //         <Text style={styles.buttonText}>Go to app</Text>
  //       )}
  //     </TouchableOpacity>
  //     {/* <TouchableOpacity
  //       onPress={() => setShowTTSBall(true)} 
  //       style={styles.button}
        
  //     >
  //       {signingOut ? (
  //         <ActivityIndicator color="#ffffff" />
  //       ) : (
  //         <Text style={styles.buttonText}>Go to app</Text>
  //       )}
  //     </TouchableOpacity> */}
  //   </View>
  // );

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Levels"
        screenOptions={{
          headerStyle: { backgroundColor: "#0f172a" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "600" },
          headerRight: () => (
            <TouchableOpacity onPress={handleSignOut}>
              <Text style={{ color: "#3b82f6", fontWeight: "700", marginRight: 12 }}>
                Logout
              </Text>
            </TouchableOpacity>
          ),
        }}
      >
        <Stack.Screen
          name="Levels"
          component={LevelsScreen}
          options={{ title: "Select Level" }}
        />
        <Stack.Screen name="Level1" component={Level1} options={{ title: "Level 1" }} />
        <Stack.Screen name="Level2" component={Level2} options={{ title: "Level 2" }} />
        <Stack.Screen name="Level3" component={Level3} options={{ title: "Level 3" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101010',
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    alignItems: 'stretch',
    backgroundColor: '#101010',
    gap: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#101010',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    color: '#cccccc',
  },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#1f1f1f',
    color: '#ffffff',
  },
  errorText: {
    color: '#ff6b6b',
  },
  button: {
    height: 52,
    borderRadius: 8,
    backgroundColor: '#3a7afe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  toggleText: {
    color: '#cccccc',
  },
  toggleLink: {
    color: '#3a7afe',
    fontWeight: '600',
  },
});

export default App;
