/**
 * DashboardScreen.js
 * Shows spending summary, budget progress bars, and a pie chart.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { PieChart } from 'react-native-chart-kit';
import { useAuth } from '../context/AuthContext';
import { fetchAllExpenses } from '../services/api';
import { formatCurrency, calcPercent, budgetColor } from '../utils/formatters';
import { checkBudgetAlert } from '../utils/notifications';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW, CATEGORY_COLORS } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    try {
      setError('');
      const res = await fetchAllExpenses(user?.id);
      const data = res.data || [];
      setExpenses(data);
      // Check budget alerts whenever data loads
      if (user?.budgets) {
        await checkBudgetAlert(data, user.budgets);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData();
    }, [loadData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalSpent = expenses.reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  const totalBudget = user?.budgets?.reduce((s, b) => s + parseFloat(b.amount || 0), 0)
    || parseFloat(user?.budget || 0);
  const remaining = totalBudget - totalSpent;

  // Spending by category
  const byCategory = {};
  expenses.forEach((e) => {
    const cat = e.category || 'Other';
    byCategory[cat] = (byCategory[cat] || 0) + parseFloat(e.amount || 0);
  });

  // Pie chart data
  const pieData = Object.entries(byCategory).map(([name, amount]) => ({
    name,
    amount,
    color: CATEGORY_COLORS[name] || '#78909c',
    legendFontColor: COLORS.textPrimary,
    legendFontSize: 12,
  }));

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading dashboard…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.username?.split('@')[0]} 👋</Text>
          <Text style={styles.subGreeting}>Here's your financial overview</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout} accessibilityLabel="Logout">
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Error */}
      {error !== '' && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️  {error}</Text>
        </View>
      )}

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: COLORS.primary }]}>
          <Text style={styles.summaryLabel}>Total Budget</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalBudget)}</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: COLORS.danger }]}>
          <Text style={styles.summaryLabel}>Total Spent</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalSpent)}</Text>
        </View>
      </View>
      <View style={[styles.remainingCard, { backgroundColor: remaining >= 0 ? COLORS.success : COLORS.warning }]}>
        <Text style={styles.remainingLabel}>{remaining >= 0 ? '✅ Remaining Budget' : '⚠️ Over Budget'}</Text>
        <Text style={styles.remainingValue}>{formatCurrency(Math.abs(remaining))}</Text>
      </View>

      {/* Budget Progress */}
      {user?.budgets && user.budgets.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Budget Progress</Text>
          {user.budgets.map((budget, idx) => {
            const spent = byCategory[budget.category] || 0;
            const pct = calcPercent(spent, budget.amount);
            const color = budgetColor(pct);
            return (
              <View key={idx} style={styles.budgetItem}>
                <View style={styles.budgetHeader}>
                  <Text style={styles.budgetCategory}>{budget.category}</Text>
                  <Text style={[styles.budgetPct, { color }]}>{pct}%</Text>
                </View>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: color }]} />
                </View>
                <Text style={styles.budgetAmounts}>
                  {formatCurrency(spent)} / {formatCurrency(budget.amount)}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Pie Chart */}
      {pieData.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Spending by Category</Text>
          <PieChart
            data={pieData}
            width={SCREEN_WIDTH - SPACING.lg * 2}
            height={200}
            chartConfig={{
              color: (opacity = 1) => `rgba(26, 115, 232, ${opacity})`,
              labelColor: () => COLORS.textPrimary,
            }}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="10"
            absolute={false}
          />
        </View>
      )}

      {/* Recent Expenses */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Expenses</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Expenses')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {expenses.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No expenses yet.</Text>
            <Text style={styles.emptySubText}>Tap "+" to add your first expense.</Text>
          </View>
        ) : (
          expenses.slice(0, 5).map((exp) => (
            <TouchableOpacity
              key={exp.id}
              style={styles.expenseRow}
              onPress={() => navigation.navigate('ExpenseDetail', { expenseId: exp.id })}
              accessibilityLabel={`View expense ${exp.name}`}
            >
              <View style={[styles.expenseDot, { backgroundColor: CATEGORY_COLORS[exp.category] || COLORS.textSecondary }]} />
              <View style={styles.expenseInfo}>
                <Text style={styles.expenseName} numberOfLines={1}>{exp.name}</Text>
                <Text style={styles.expenseCat}>{exp.category || 'Uncategorized'} · {exp.date || ''}</Text>
              </View>
              <Text style={styles.expenseAmount}>{formatCurrency(exp.amount)}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Quick Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddExpense')}
        accessibilityRole="button"
        accessibilityLabel="Add new expense"
      >
        <Text style={styles.fabText}>+ Add Expense</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  loadingText: { marginTop: SPACING.md, color: COLORS.textSecondary, fontSize: FONTS.sizes.md },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.lg },
  greeting: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.textPrimary },
  subGreeting: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  logoutBtn: { backgroundColor: COLORS.dangerLight, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full },
  logoutText: { color: COLORS.danger, fontSize: FONTS.sizes.sm, fontWeight: '600' },
  errorBanner: { backgroundColor: COLORS.dangerLight, borderRadius: RADIUS.sm, padding: SPACING.md, marginBottom: SPACING.md, borderLeftWidth: 4, borderLeftColor: COLORS.danger },
  errorText: { color: COLORS.danger, fontSize: FONTS.sizes.sm },
  summaryRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.md },
  summaryCard: { flex: 1, borderRadius: RADIUS.md, padding: SPACING.md, ...SHADOW.small },
  summaryLabel: { color: 'rgba(255,255,255,0.8)', fontSize: FONTS.sizes.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryValue: { color: COLORS.white, fontSize: FONTS.sizes.lg, fontWeight: '700', marginTop: SPACING.xs },
  remainingCard: { borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', ...SHADOW.small },
  remainingLabel: { color: COLORS.white, fontSize: FONTS.sizes.sm, fontWeight: '600' },
  remainingValue: { color: COLORS.white, fontSize: FONTS.sizes.xl, fontWeight: '700' },
  section: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md, ...SHADOW.small },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.md },
  seeAll: { color: COLORS.primary, fontSize: FONTS.sizes.sm, fontWeight: '600' },
  budgetItem: { marginBottom: SPACING.md },
  budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
  budgetCategory: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.textPrimary },
  budgetPct: { fontSize: FONTS.sizes.md, fontWeight: '700' },
  progressBg: { height: 8, backgroundColor: COLORS.border, borderRadius: RADIUS.full, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: RADIUS.full },
  budgetAmounts: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: SPACING.xs },
  expenseRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  expenseDot: { width: 10, height: 10, borderRadius: 5, marginRight: SPACING.sm },
  expenseInfo: { flex: 1 },
  expenseName: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.textPrimary },
  expenseCat: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: 2 },
  expenseAmount: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.danger },
  emptyBox: { alignItems: 'center', paddingVertical: SPACING.xl },
  emptyIcon: { fontSize: 40, marginBottom: SPACING.sm },
  emptyText: { fontSize: FONTS.sizes.lg, fontWeight: '600', color: COLORS.textSecondary },
  emptySubText: { fontSize: FONTS.sizes.sm, color: COLORS.textDisabled, marginTop: SPACING.xs },
  fab: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingVertical: SPACING.md, alignItems: 'center', marginTop: SPACING.md, ...SHADOW.medium },
  fabText: { color: COLORS.white, fontSize: FONTS.sizes.lg, fontWeight: '700' },
});

export default DashboardScreen;
