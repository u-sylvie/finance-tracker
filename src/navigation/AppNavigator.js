/**
 * AppNavigator.js
 * Root navigation structure.
 * - Unauthenticated: LoginScreen
 * - Authenticated: Bottom tab navigator with nested stack navigators
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ExpensesScreen from '../screens/ExpensesScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import ExpenseDetailScreen from '../screens/ExpenseDetailScreen';
import EditExpenseScreen from '../screens/EditExpenseScreen';
import BudgetScreen from '../screens/BudgetScreen';
import { COLORS, FONTS } from '../constants/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Tab icon helper ──────────────────────────────────────────────────────────
const TabIcon = ({ emoji, focused }) => (
  <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.6 }}>{emoji}</Text>
);

// ─── Expenses Stack ───────────────────────────────────────────────────────────
const ExpensesStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: COLORS.primary },
      headerTintColor: COLORS.white,
      headerTitleStyle: { fontWeight: '700', fontSize: FONTS.sizes.lg },
    }}
  >
    <Stack.Screen
      name="ExpensesList"
      component={ExpensesScreen}
      options={{ title: 'All Expenses' }}
    />
    <Stack.Screen
      name="ExpenseDetail"
      component={ExpenseDetailScreen}
      options={{ title: 'Expense Details' }}
    />
    <Stack.Screen
      name="AddExpense"
      component={AddExpenseScreen}
      options={{ title: 'Add Expense' }}
    />
    <Stack.Screen
      name="EditExpense"
      component={EditExpenseScreen}
      options={{ title: 'Edit Expense' }}
    />
  </Stack.Navigator>
);

// ─── Dashboard Stack ──────────────────────────────────────────────────────────
const DashboardStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: COLORS.primary },
      headerTintColor: COLORS.white,
      headerTitleStyle: { fontWeight: '700', fontSize: FONTS.sizes.lg },
    }}
  >
    <Stack.Screen
      name="DashboardHome"
      component={DashboardScreen}
      options={{ title: 'Dashboard', headerShown: false }}
    />
    <Stack.Screen
      name="Expenses"
      component={ExpensesScreen}
      options={{ title: 'All Expenses' }}
    />
    <Stack.Screen
      name="ExpenseDetail"
      component={ExpenseDetailScreen}
      options={{ title: 'Expense Details' }}
    />
    <Stack.Screen
      name="AddExpense"
      component={AddExpenseScreen}
      options={{ title: 'Add Expense' }}
    />
    <Stack.Screen
      name="EditExpense"
      component={EditExpenseScreen}
      options={{ title: 'Edit Expense' }}
    />
  </Stack.Navigator>
);

// ─── Main Tab Navigator ───────────────────────────────────────────────────────
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.textDisabled,
      tabBarStyle: {
        backgroundColor: COLORS.white,
        borderTopColor: COLORS.border,
        borderTopWidth: 1,
        height: 60,
        paddingBottom: 8,
        paddingTop: 4,
      },
      tabBarLabelStyle: {
        fontSize: FONTS.sizes.xs,
        fontWeight: '600',
      },
      headerShown: false,
    }}
  >
    <Tab.Screen
      name="Dashboard"
      component={DashboardStack}
      options={{
        tabBarLabel: 'Dashboard',
        tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Expenses"
      component={ExpensesStack}
      options={{
        tabBarLabel: 'Expenses',
        tabBarIcon: ({ focused }) => <TabIcon emoji="💸" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Budget"
      component={BudgetScreen}
      options={{
        tabBarLabel: 'Budget',
        tabBarIcon: ({ focused }) => <TabIcon emoji="🎯" focused={focused} />,
        headerShown: true,
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: '700', fontSize: FONTS.sizes.lg },
        title: 'My Budget',
      }}
    />
  </Tab.Navigator>
);

// ─── Root Navigator ───────────────────────────────────────────────────────────
const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashEmoji}>💰</Text>
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 16 }} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  splashEmoji: {
    fontSize: 64,
  },
});

export default AppNavigator;
