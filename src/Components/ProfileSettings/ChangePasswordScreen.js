import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  linkWithCredential,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigation } from '@react-navigation/native';
import {
  configureGoogleSignin,
  reauthenticateCurrentUserWithGoogle,
} from '../../services/googleAuth';

export default function ChangePasswordScreen({}) {
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [hasPasswordProvider, setHasPasswordProvider] = useState(
    !!auth.currentUser?.providerData?.some(
      provider => provider.providerId === 'password',
    ),
  );
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigation = useNavigation();

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    configureGoogleSignin();

    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setHasPasswordProvider(
        !!user?.providerData?.some(
          provider => provider.providerId === 'password',
        ),
      );
    });

    return unsubscribe;
  }, []);

  const handleChangePassword = async () => {
    const user = currentUser || auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'You must be logged in to change your password.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }

    if (hasPasswordProvider) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        Alert.alert('Error', 'Please fill out all fields.');
        return;
      }
    } else {
      if (!newPassword || !confirmPassword) {
        Alert.alert('Error', 'Please fill out both password fields.');
        return;
      }
    }

    setLoading(true);

    try {
      if (hasPasswordProvider) {
        const credential = EmailAuthProvider.credential(
          user.email,
          currentPassword,
        );
        await reauthenticateWithCredential(user, credential);

        await updatePassword(user, newPassword);
      } else {
        if (!user.email) {
          throw new Error('No email associated with this account.');
        }

        await reauthenticateCurrentUserWithGoogle();
        const emailCredential = EmailAuthProvider.credential(
          user.email,
          newPassword,
        );
        await linkWithCredential(user, emailCredential);
        setHasPasswordProvider(true);
      }

      Alert.alert('Success', 'Password updated successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            navigation.navigate('Home');
          },
        },
      ]);
    } catch (error) {
      console.error('Password update error:', error);
      const code = error?.code;
      if (code === 'auth/wrong-password') {
        Alert.alert('Error', 'Current password is incorrect.');
      } else if (code === 'auth/too-many-requests') {
        Alert.alert('Error', 'Too many failed attempts. Try again later.');
      } else if (code === 'auth/provider-already-linked') {
        Alert.alert(
          'Notice',
          'A password is already linked to this account. Please sign in again and try changing it.',
        );
        setHasPasswordProvider(true);
      } else if (code === 'auth/requires-recent-login') {
        Alert.alert(
          'Error',
          'Please sign in again with Google and retry.',
        );
      } else {
        Alert.alert(
          'Error',
          'Failed to update password. Please try again.',
        );
      }
    }

    setLoading(false);
  };

  const actionLabel = hasPasswordProvider ? 'Change' : 'Set';
  const subtitle = hasPasswordProvider
    ? 'Enter your current and new passwords below.'
    : 'Create a password to sign in without Google next time.';

  return (
    <SafeAreaView style={S.container}>
      <ScrollView
        contentContainerStyle={S.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={S.title}>{actionLabel} Password</Text>
        <Text style={S.subtitle}>{subtitle}</Text>

        {/* Current Password */}
        {hasPasswordProvider && (
          <View style={S.field}>
            <Text style={S.label}>Current Password</Text>
            <View style={S.passwordRow}>
              <TextInput
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrent}
                placeholder="Enter current password"
                placeholderTextColor="#8A8A8A"
                style={[S.input, { flex: 1 }]}
              />
              <TouchableOpacity
                onPress={() => setShowCurrent(!showCurrent)}
                style={S.eyeButton}
              >
                <Feather
                  name={showCurrent ? 'eye' : 'eye-off'}
                  size={20}
                  color="#555"
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* New Password */}
        <View style={S.field}>
          <Text style={S.label}>
            {hasPasswordProvider ? 'New Password' : 'Password'}
          </Text>
          <View style={S.passwordRow}>
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNew}
              placeholder="Enter new password"
              placeholderTextColor="#8A8A8A"
              style={[S.input, { flex: 1 }]}
            />
            <TouchableOpacity
              onPress={() => setShowNew(!showNew)}
              style={S.eyeButton}
            >
              <Feather
                name={showNew ? 'eye' : 'eye-off'}
                size={20}
                color="#555"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm New Password */}
        <View style={S.field}>
          <Text style={S.label}>
            {hasPasswordProvider ? 'Confirm New Password' : 'Confirm Password'}
          </Text>
          <View style={S.passwordRow}>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirm}
              placeholder="Re-enter new password"
              placeholderTextColor="#8A8A8A"
              style={[S.input, { flex: 1 }]}
            />
            <TouchableOpacity
              onPress={() => setShowConfirm(!showConfirm)}
              style={S.eyeButton}
            >
              <Feather
                name={showConfirm ? 'eye' : 'eye-off'}
                size={20}
                color="#555"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Change Password Button */}
        <TouchableOpacity
          onPress={handleChangePassword}
          style={[S.saveButton, loading && S.saveButtonDisabled]}
          disabled={
            loading ||
            (hasPasswordProvider
              ? !currentPassword || !newPassword || !confirmPassword
              : !newPassword || !confirmPassword)
          }
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={S.saveButtonText}>{actionLabel} Password</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EAF1FF' },
  scrollContent: { alignItems: 'center', paddingVertical: 30 },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 30,
  },
  field: { width: '85%', marginBottom: 20 },
  label: { fontSize: 15, color: '#222', marginBottom: 8, fontWeight: '500' },
  input: {
    backgroundColor: '#F7FAFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#000',
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  eyeButton: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    borderRadius: 14,
    width: '85%',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
