import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Inicializar Firebase
import './config/firebaseConfig';

import { AuthProvider, useAuth } from './hooks/useAuth';
import { CodesProvider } from './hooks/useCodes';
import { NotificationProvider } from './hooks/useNotifications';
import { MainTabParamList, RootStackParamList } from './types';

import CodesScreen from './screens/CodeScreen';
import ExploreScreen from './screens/ExploreScreen';
import LoginScreen from './screens/LoginScreen';
import RestaurantScreen from './screens/RestaurantScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let name: React.ComponentProps<typeof Ionicons>['name'] = 'home';
          if (route.name === 'Explore') name = 'restaurant';
          if (route.name === 'Codes') name = 'pricetag';
          return <Ionicons name={name} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Codes" component={CodesScreen} />
    </Tab.Navigator>
  );
}

function RootNavigation() {
  const { user } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // Autenticado -> mostrar app con RestaurantScreen
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="Restaurant" component={RestaurantScreen} />
        </>
      ) : (
        // No autenticado -> mostrar login
        <Stack.Screen name="Auth" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider style={styles.container}>
      <AuthProvider>
        <NotificationProvider>
          <CodesProvider>
            <NavigationContainer>
              <RootNavigation />
            </NavigationContainer>
          </CodesProvider>
        </NotificationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
