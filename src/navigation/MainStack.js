import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import DailyArticleMain from '../screens/DailyArticleMain';
import LevelsScreen from '../screens/LevelsScreen.js';
import NotebookScreen from '../screens/NotebookScreen';
import Last7DaysScreen from '../screens/Last7DaysScreen';
import BookmarkedArticles from '../screens/BookmarkedArticles';
import ProfileSettingScreen from '../pages/ProfileSettingScreen.js';
import ArticleDetail from '../screens/ArticleDetail.jsx';
import Onboarding from '../pages/Onboarding';

const Stack = createNativeStackNavigator();

export default function MainStack() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: '#ffffff' },
        headerTintColor: '#111827',
        headerTitleStyle: { fontWeight: '600', color: '#111827', letterSpacing: 1 },
        headerBackTitleVisible: false,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Home' }}
      />

      <Stack.Screen
        name="Article"
        component={DailyArticleMain}
        options={{ title: 'Daily Article' }}
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
        name="Levels"
        component={LevelsScreen}
        options={{ title: 'Practice Levels' }}
      />

      <Stack.Screen
        name="Notebook"
        component={NotebookScreen}
        options={{ title: 'Notebook' }}
      />

      <Stack.Screen
        name="ProfileSettingScreen"
        component={ProfileSettingScreen}
        options={{ title: 'Profile Settings' }}
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
