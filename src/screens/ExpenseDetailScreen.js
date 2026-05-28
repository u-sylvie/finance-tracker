/**
 * ExpenseDetailScreen.js
 * Task 3 – Show expense details using GET /expenses/:id.
 * Task 5 – Delete expense using DELETE /expenses/:id.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { fetchExpenseById, removeExpense } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW, CATEGORY_COLORS } from '../constants/theme';

// Cross-platform alert that works on both web and native
const showAlert = (title, message, buttons) => {
  if (Platform.OS === 'web') {
    const confirmed = window.confirm(`${title}\n\n${message}`);
    if (confirmed) {
      const confirmBtn = buttons.find((b) => b.style === 'destructive' || b.text === 'Delete');
      if (confirmBtn?.onPress) confirmBtn.onPress();
    }
  } else {
    Alert.alert(title, message, buttons);
  }
};

const DetailRow = ({ label, value, valueStyle }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={[styles.detailValue, valueStyle]}>{value || '—'}</Text>
  </View>
);

const ExpenseDetailScreen = ({ route, navigation }) => {
  const { expenseId } = route.params;

  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadExpense();
  }, [expenseId]);

  const loadExpense = async () => {
    try {
      setError('');
      setLoading(true);
      const res = await fetchExpenseById(expenseId);
      setExpense(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load expense details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    showAlert(
      'Delete Expense',
      `Are you sure you want to delete "${expense?.name}"?\n\nThis action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await removeExpense(expenseId);
              if (Platform.OS === 'web') {
                navigation.goBack();
              } else {
                Alert.alert('Deleted', 'The expense has been removed.', [
                  { text: 'OK', onPress: () => navigation.goBack() },
                ]);
              }
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to delete expense.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading expense details…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMsg}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={loadExpense}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!expense) return null;

  const catColor = CATEGORY_COLORS[expense.category] || COLORS.textSecondary;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: catColor }]}>
        <View style={styles.heroIcon}>
          <Text style={styles.heroIconText}>{(expense.category || 'O').charAt(0)}</Text>
        </View>
        <Text style={styles.heroName}>{expense.name}</Text>
        <Text style={styles.heroAmount}>{formatCurrency(expense.amount)}</Text>
        {expense.category && (
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>{expense.category}</Text>
          </View>
        )}
      </View>

      {/* Details Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Expense Details</Text>

        <DetailRow label="ID" value={`#${expense.id}`} />
        <DetailRow label="Name" value={expense.name} />
        <DetailRow
          label="Amount"
          value={formatCurrency(expense.amount)}
          valueStyle={{ color: COLORS.danger, fontWeight: '700' }}
        />
        <DetailRow label="Category" value={expense.category || 'Uncategorized'} />
        <DetailRow label="Date" value={formatDate(expense.date || expense.createdAt)} />
        <DetailRow label="Description" value={expense.description || 'No description provided.'} />
        <DetailRow label="Recorded On" value={formatDate(expense.createdAt)} />
        {expense.userId && <DetailRow label="User ID" value={expense.userId} />}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('EditExpense', { expense })}
          accessibilityRole="button"
          accessibilityLabel="Edit expense"
        >
          <Text style={styles.editBtnText}>✏️  Edit Expense</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.deleteBtn, deleting && styles.deleteBtnDisabled]}
          onPress={handleDelete}
          disabled={deleting}
          accessibilityRole="button"
          accessibilityLabel="Delete expense"
        >
          {deleting ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <Text style={styles.deleteBtnText}>🗑️  Delete Expense</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backBtnText}>← Back to List</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: SPACING.xxl },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.lg, backgroundColor: COLORS.background },
  loadingText: { marginTop: SPACING.md, color: COLORS.textSecondary },
  errorIcon: { fontSize: 48, marginBottom: SPACING.md },
  errorTitle: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.xs },
  errorMsg: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.lg },
  retryBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  retryBtnText: { color: COLORS.white, fontWeight: '700' },
  hero: {
    padding: SPACING.xl,
    alignItems: 'center',
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xl + SPACING.lg,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  heroIconText: { color: COLORS.white, fontSize: FONTS.sizes.xxxl, fontWeight: '700' },
  heroName: { color: COLORS.white, fontSize: FONTS.sizes.xxl, fontWeight: '700', textAlign: 'center' },
  heroAmount: { color: COLORS.white, fontSize: FONTS.sizes.xxxl, fontWeight: '700', marginTop: SPACING.xs },
  heroBadge: {
    marginTop: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  heroBadgeText: { color: COLORS.white, fontSize: FONTS.sizes.sm, fontWeight: '600' },
  card: {
    backgroundColor: COLORS.white,
    margin: SPACING.lg,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginTop: -SPACING.lg,
    ...SHADOW.medium,
  },
  cardTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: SPACING.sm },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  detailLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, fontWeight: '500', flex: 1 },
  detailValue: { fontSize: FONTS.sizes.sm, color: COLORS.textPrimary, fontWeight: '600', flex: 2, textAlign: 'right' },
  actions: { paddingHorizontal: SPACING.lg, gap: SPACING.sm },
  editBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    ...SHADOW.small,
  },
  editBtnText: { color: COLORS.white, fontSize: FONTS.sizes.md, fontWeight: '700' },
  deleteBtn: {
    backgroundColor: COLORS.danger,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    ...SHADOW.small,
  },
  deleteBtnDisabled: { opacity: 0.7 },
  deleteBtnText: { color: COLORS.white, fontSize: FONTS.sizes.md, fontWeight: '700' },
  backBtn: {
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  backBtnText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md, fontWeight: '600' },
});

export default ExpenseDetailScreen;
