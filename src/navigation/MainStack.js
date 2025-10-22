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

export default function MainStack({ user }) {
  console.log("USER",user)

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
        options={{ title: 'Home' }}
      >
        {(props) => <HomeScreen {...props} user={user} />}
      </Stack.Screen>

      <Stack.Screen
        name="Article"
        options={{ title: 'Daily Article' }}
      >
        {(props) => <DailyArticleMain {...props} userId={user.uid} />}
      </Stack.Screen>

      <Stack.Screen
        name="Last7Days"
        options={{ title: 'Articles: Last 7 Days' }}
      >
        {(props) => <Last7DaysScreen {...props} userId={user.uid} />}
      </Stack.Screen>

      <Stack.Screen
        name="ArticleDetail"
        options={{ title: 'Article' }}
      >
        {(props) => (
          <ArticleDetail
            userId={user.uid}
            articleId={props.route?.params?.articleId}
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="Levels"
        component={LevelsScreen}
        options={{ title: 'Practice Levels' }}
      />

      <Stack.Screen
        name="Notebook"
        options={{ title: 'Notebook' }}
      >
        {(props) => <NotebookScreen {...props} userId={user.uid} />}
      </Stack.Screen>
      <Stack.Screen
        name="ProfileSettingScreen"
        component={ProfileSettingScreen}
        options={{ title: 'Profile Settings' }}
      />

      <Stack.Screen
        name="BookmarkedArticles"
        options={{ title: 'Bookmark' }}
      >
        {(props) => <BookmarkedArticles {...props} userId={user.uid} />}
      </Stack.Screen>

      <Stack.Screen
        name="Onboarding"
        options={{ title: 'Anxiety Assessment', headerShown: false }}
      >
        {(props) => <Onboarding {...props} user={user} />}
      </Stack.Screen>

    </Stack.Navigator>
  );
}
