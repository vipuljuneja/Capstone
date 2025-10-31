import React, { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { HeaderBackButton } from '@react-navigation/elements';

// import HomeScreen from '../screens/HomeScreen';
import DailyArticleMain from '../screens/DailyArticleMain';
// import LevelsScreen from '../screens/LevelsScreen.js';
import NotebookScreen from '../screens/NotebookScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen.js';
import TermsScreen from '../screens/TermsScreen.js';
import Last7DaysScreen from '../screens/Last7DaysScreen';
import BookmarkedArticles from '../screens/BookmarkedArticles';
import ProfileSettingScreen from '../pages/ProfileSettingScreen.js';
import ArticleDetail from '../screens/ArticleDetail.jsx';
import Onboarding from '../pages/Onboarding';
import ProfileScreen from '../screens/ProfileScreen.js';
import ChangePasswordScreen from '../Components/ProfileSettings/ChangePasswordScreen.js';
// import Levels from '../pages/levels/Levels.js';
// import ResultsScreen from '../pages/levels/Results.js';
import PipoDetailScreen from '../Components/Notebook/PipoDetailScreen';
import EmotionalSupportScreen from '../screens/EmotionalSupportScreen.js';

import HomeScreenLevels from '../pages/home/HomeScreen.js';
import LevelsOptions from '../pages/home/LevelOptionsScreen.js';
import Level1Screen from '../pages/level1/Level1Screen.js';
import Level1IntroScreen from '../pages/level1/Level1IntroScreen';
import Level1ResultScreen from '../pages/level1/Level1ResultScreen';

import Level2NoticeScreen from '../pages/level2/Level2NoticeScreen';
import Level2IntroScreen from '../pages/level2/Level2IntroScreen';
import Level2Screen from '../pages/level2/Level2Screen';
import Level2ResultScreen from '../pages/level2/Level2ResultScreen';

import Level3NoticeScreen from '../pages/level3/Level3NoticeScreen';
import Level3IntroScreen from '../pages/level3/Level3IntroScreen';
import Level3Screen from '../pages/level3/Level3Screen';
import Level3ResultScreen from '../pages/level3/Level3ResultScreen';

import BackIcon from '../../assets/icons/back.svg';

import { useAuth } from '../contexts/AuthContext';

const Stack = createNativeStackNavigator();
export default function MainStack() {
  const { user, mongoUser, loading } = useAuth();
  const [initialRoute, setInitialRoute] = useState('Home');
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    if (loading) {
      setCheckingOnboarding(true);
      return;
    }

    if (!user?.uid) {
      setInitialRoute('Home');
      setCheckingOnboarding(false);
      return;
    }

    if (!mongoUser) {
      setInitialRoute('Onboarding');
      setCheckingOnboarding(false);
      return;
    }

    const completed = mongoUser?.onboarding?.completed;
    console.log(mongoUser)
    setInitialRoute(completed ? 'Home' : 'Onboarding');
    setCheckingOnboarding(false);
  }, [user?.uid, mongoUser, loading]);



  if (checkingOnboarding) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f0',
        }}
      >
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return (
    <Stack.Navigator initialRouteName={initialRoute}
      screenOptions={{
        headerStyle: { backgroundColor: '#ffffff' },
        headerTintColor: '#111827',
        headerTitleStyle: {
          fontWeight: '600',
          color: '#111827',
          letterSpacing: 1,
        },
        headerBackTitleVisible: false,
        headerShadowVisible: false,
        animation: 'slide_from_right',
        headerBackTitleVisible: Platform.OS === 'ios' ? false : undefined,
        headerBackTitle: Platform.OS === 'ios' ? ' ' : undefined,
        headerTruncatedBackTitle: ' ',
        headerBackTitleStyle: { display: 'none' },
        // headerLeft: () => (
        //   <TouchableOpacity onPress={() => navigation.goBack()}>
        //     <BackIcon width={16} height={16} />
        //   </TouchableOpacity>
        // ),
      }}
    >
      {/* <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Home' }}
      /> */}

      <Stack.Screen
        name="Article"
        component={DailyArticleMain}
        options={{ title: 'Daily Article' }}
      />

      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{ title: 'Privacy Policy' }}
      />
      <Stack.Screen
        name="Terms"
        component={TermsScreen}
        options={{ title: 'Terms of Use' }}
      />
      <Stack.Screen
        name="EmotionalSupport"
        component={EmotionalSupportScreen}
        options={{
          title: 'Emotional Support',
          headerBackTitleVisible: false,
        }}
      />

      <Stack.Screen
        name="Last7Days"
        component={Last7DaysScreen}
        options={{ title: 'Articles: Last 7 Days' }}
      />

      <Stack.Screen
        name="ArticleDetail"
        component={ArticleDetail}
        options={{ title: 'Article' }}
      />

      <Stack.Screen
        name="Home"
        component={HomeScreenLevels}
        options={{ title: 'Home', headerShown: false ,gestureEnabled: false }}
      />

      {/* <Stack.Screen
        name="Results"
        component={ResultsScreen}
        options={{ title: 'Results' }}
      /> */}

      <Stack.Screen
        name="LevelOptions"
        component={LevelsOptions}
        options={{
          title: 'LevelsOptions',
          headerBackTitleVisible: false,
          headerShown: false,
          headerBackTitle: ' ',
          headerBackTitleStyle: { fontSize: 0 },
        }}
      />

      <Stack.Screen
        name="Level1Screen"
        component={Level1Screen}
        options={{ title: 'Level1Screen', headerShown: false }}
      />

      <Stack.Screen
        name="Level1IntroScreen"
        component={Level1IntroScreen}
        options={{ title: 'Level1IntroScreen' }}
      />

      <Stack.Screen
        name="Level1ResultScreen"
        component={Level1ResultScreen}
        options={{ title: 'Level1ResultScreen', headerShown: false }}
      />

      <Stack.Screen name="Level2NoticeScreen" component={Level2NoticeScreen} />

      <Stack.Screen name="Level2IntroScreen" component={Level2IntroScreen} />

      <Stack.Screen
        name="Level2Screen"
        component={Level2Screen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Level2ResultScreen"
        component={Level2ResultScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen name="Level3NoticeScreen" component={Level3NoticeScreen} />

      <Stack.Screen name="Level3IntroScreen" component={Level3IntroScreen} />

      <Stack.Screen
        name="Level3Screen"
        component={Level3Screen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Level3ResultScreen"
        component={Level3ResultScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />

      <Stack.Screen
        name="Notebook"
        component={NotebookScreen}
        options={{ title: 'Notebook' }}
      />
      <Stack.Screen
        name="PipoDetail"
        component={PipoDetailScreen}
        options={{ title: 'Notebook detail' }}
      />
      <Stack.Screen
        name="ProfileSettingScreen"
        component={ProfileSettingScreen}
        options={{ title: 'Profile Settings' }}
      />

      <Stack.Screen
        name="ChangePasswordScreen"
        component={ChangePasswordScreen}
        options={{ title: 'Change Password' }}
      />

      <Stack.Screen
        name="BookmarkedArticles"
        component={BookmarkedArticles}
        options={{ title: 'Bookmark' }}
      />

      <Stack.Screen
        name="Onboarding"
        component={Onboarding}
        options={{ title: 'Anxiety Assessment', headerShown: false }}
      />
    </Stack.Navigator>
  );
}
