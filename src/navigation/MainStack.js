import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Text } from 'react-native';

import HomeScreen from '../screens/HomeScreen';            
import DailyArticleMain from '../screens/DailyArticleMain';
import LevelsScreen from '../screens/LevelsScreen.js';        
import NotebookScreen from '../screens/NotebookScreen';    
import Last7DaysScreen from '../screens/Last7DaysScreen';  
import BookmarkedArticles from '../screens/BookmarkedArticles'

const Stack = createNativeStackNavigator();

export default function MainStack({ user }) {
    
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: '#1e293b' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600' },
        headerBackTitle: 'Back', 
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
        component={Last7DaysScreen}
        options={{ title: 'Articles: Last 7 Days' }}
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
        name="BookmarkedArticles"
        // component={BookmarkedArticles}
        options={{ title: 'Bookmark' }}
      >{(props) => <BookmarkedArticles {...props} userId={user.uid} />}
      </Stack.Screen>

    </Stack.Navigator>
  );
}
