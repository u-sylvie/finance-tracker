/**
 * notifications.js
 * Handles push notification registration and budget-limit alerts.
 * Gracefully skips on web and simulators where native APIs are unavailable.
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Only configure the handler on native platforms
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/**
 * Request notification permissions.
 * Skips silently on web or simulators.
 */
export const registerForPushNotifications = async () => {
  if (Platform.OS === 'web') return null;
  if (!Device.isDevice) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('budget-alerts', {
      name: 'Budget Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return finalStatus;
};

/**
 * Send a local notification immediately.
 * Skips silently on web.
 */
export const sendLocalNotification = async (title, body) => {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: null,
    });
  } catch (_) {
    // Silently ignore — notifications not critical to app function
  }
};

/**
 * Check if spending in any category exceeds the budget limit.
 * Fires a local notification if so.
 */
export const checkBudgetAlert = async (expenses, budgets) => {
  if (Platform.OS === 'web') return;
  if (!budgets || budgets.length === 0) return;

  const totals = {};
  expenses.forEach((exp) => {
    const cat = exp.category || 'Uncategorized';
    totals[cat] = (totals[cat] || 0) + parseFloat(exp.amount || 0);
  });

  for (const budget of budgets) {
    const spent = totals[budget.category] || 0;
    const limit = parseFloat(budget.amount);
    if (!limit) continue;
    const pct = (spent / limit) * 100;

    if (pct >= 100) {
      await sendLocalNotification(
        `⚠️ Budget Exceeded: ${budget.category}`,
        `You spent ${spent.toLocaleString()} RWF, exceeding your ${limit.toLocaleString()} RWF budget.`
      );
    } else if (pct >= 80) {
      await sendLocalNotification(
        `🔔 Budget Warning: ${budget.category}`,
        `You've used ${pct.toFixed(0)}% of your ${budget.category} budget.`
      );
    }
  }
};
