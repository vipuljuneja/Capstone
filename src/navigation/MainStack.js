import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import DailyArticleMain from '../screens/DailyArticleMain';
// import LevelsScreen from '../screens/LevelsScreen.js'; 
import NotebookScreen from '../screens/NotebookScreen';
import Last7DaysScreen from '../screens/Last7DaysScreen';
import BookmarkedArticles from '../screens/BookmarkedArticles';
import ProfileSettingScreen from '../pages/ProfileSettingScreen.js';
import ArticleDetail from '../screens/ArticleDetail.jsx';
import Onboarding from '../pages/Onboarding';
import ProfileScreen from '../screens/ProfileScreen.js';
import ChangePasswordScreen from '../Components/ProfileSettings/ChangePasswordScreen.js';
import Levels from '../pages/Levels/Levels.js';
import ResultsScreen from '../pages/Levels/Results.js';
import PipoDetailScreen from '../Components/Notebook/PipoDetailScreen'

const Stack = createNativeStackNavigator();

export default function MainStack({ user, mongoUser }) {
  const uid = user?.uid;
  const mongoId = mongoUser?._id;

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
      <Stack.Screen name="Home" options={{ title: 'Home' }}>
        {(props) => <HomeScreen {...props} user={user} />}
      </Stack.Screen>

      <Stack.Screen name="Article" options={{ title: 'Daily Article' }}>
        {(props) => <DailyArticleMain {...props} userId={uid} />}
      </Stack.Screen>

      <Stack.Screen name="Last7Days" options={{ title: 'Articles: Last 7 Days' }}>
        {(props) => <Last7DaysScreen {...props} userId={uid} />}
      </Stack.Screen>

      <Stack.Screen name="ArticleDetail" options={{ title: 'Article' }}>
        {(props) => (
          <ArticleDetail
            {...props}
            userId={uid}
            articleId={props.route?.params?.articleId}
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="Levels"
        component={Levels}
        options={{ title: 'Practice Levels' }}
      />

      <Stack.Screen name="Results" options={{ title: 'Results' }}>
        {(props) => <ResultsScreen {...props} userId={uid} />}
      </Stack.Screen>

      <Stack.Screen name="Profile" options={{ title: 'Profile' }}>
        {(props) => <ProfileScreen {...props} />}
      </Stack.Screen>

      <Stack.Screen name="Notebook" options={{ title: 'Notebook' }}>
        {(props) => <NotebookScreen {...props} userId={mongoId} />}
      </Stack.Screen>
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

      <Stack.Screen name="BookmarkedArticles" options={{ title: 'Bookmark' }}>
        {(props) => <BookmarkedArticles {...props} userId={uid} />}
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
