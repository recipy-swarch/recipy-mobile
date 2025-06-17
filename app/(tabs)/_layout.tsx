import { FontAwesome } from '@expo/vector-icons';
import { router, Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

import userService from '../services/userService';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const auth = await userService.isAuthenticated();
    setIsAuthenticated(auth);
  };

  const handleAuthPress = async () => {
    if (isAuthenticated) {
      await userService.logoutUser();
      setIsAuthenticated(false);
      router.replace('/');
    } else {
      router.push('/login');
    }
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerStyle: {
          height: 60,
        },
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: 'bold',
        },
        headerRight: () => (
          <TouchableOpacity
            onPress={handleAuthPress}
            style={styles.authButton}
          >
            <FontAwesome 
              name={isAuthenticated ? "sign-out" : "user"} 
              size={20} 
              color={Colors[colorScheme ?? 'light'].text} 
            />
          </TouchableOpacity>
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Recetas',
          tabBarIcon: ({ color }) => <TabBarIcon name="cutlery" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  authButton: {
    marginRight: 15,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
});
