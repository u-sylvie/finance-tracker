/**
 * App.js
 * Entry point for the Personal Finance Tracker application.
 * ABCD Ltd – NE Mobile Practical
 *
 * Initialises:
 *  - Notification permissions
 *  - Authentication context
 *  - Navigation
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { registerForPushNotifications } from './src/utils/notifications';

export default function App() {
  useEffect(() => {
    // Request notification permissions
    registerForPushNotifications();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
