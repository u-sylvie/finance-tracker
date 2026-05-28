/**
 * ExpensesScreen.js
 * Task 4 – Display all expenses using GET /expenses.
 * Supports search, filter by category, and pull-to-refresh.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';

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
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { fetchAllExpenses, removeExpense } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW, CATEGORIES, CATEGORY_COLORS } from '../constants/theme';

const ExpensesScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [error, setError] = useState('');

  const loadExpenses = useCallback(async () => {
    try {
      setError('');
      const res = await fetchAllExpenses(user?.id);
      const data = res.data || [];
      // Sort newest first
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setExpenses(data);
      applyFilters(data, search, activeCategory);
    } catch (err) {
      setError(err.message || 'Failed to load expenses.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadExpenses();
    }, [loadExpenses])
  );

  const applyFilters = (data, searchTerm, category) => {
    let result = [...data];
    if (category !== 'All') {
      result = result.filter((e) => e.category === category);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (e) =>
          e.name?.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q) ||
          e.category?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  };

  const handleSearch = (text) => {
    setSearch(text);
    applyFilters(expenses, text, activeCategory);
  };

  const handleCategoryFilter = (cat) => {
    setActiveCategory(cat);
    applyFilters(expenses, search, cat);
  };

  const handleDelete = (id, name) => {
    showAlert(
      'Delete Expense',
      `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeExpense(id);
              const updated = expenses.filter((e) => e.id !== id);
              setExpenses(updated);
              applyFilters(updated, search, activeCategory);
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to delete expense.');
            }
          },
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadExpenses();
  };

  const totalShown = filtered.reduce((s, e) => s + parseFloat(e.amount || 0), 0);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardTouchable}
        onPress={() => navigation.navigate('ExpenseDetail', { expenseId: item.id })}
        accessibilityLabel={`Expense: ${item.name}, amount ${item.amount}`}
      >
        <View style={[styles.categoryBadge, { backgroundColor: CATEGORY_COLORS[item.category] || COLORS.textSecondary }]}>
          <Text style={styles.categoryBadgeText}>{(item.category || 'Other').charAt(0)}</Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.expenseName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.expenseMeta}>
            {item.category || 'Uncategorized'} · {formatDate(item.date || item.createdAt)}
          </Text>
          {item.description ? (
            <Text style={styles.expenseDesc} numberOfLines={1}>{item.description}</Text>
          ) : null}
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.expenseAmount}>{formatCurrency(item.amount)}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => handleDelete(item.id, item.name)}
        accessibilityLabel={`Delete expense ${item.name}`}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.deleteBtnText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading expenses…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍  Search expenses…"
          placeholderTextColor={COLORS.textDisabled}
          value={search}
          onChangeText={handleSearch}
          accessibilityLabel="Search expenses"
        />
      </View>

      {/* Category Filter */}
      <FlatList
        horizontal
        data={['All', ...CATEGORIES]}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, activeCategory === item && styles.filterChipActive]}
            onPress={() => handleCategoryFilter(item)}
            accessibilityLabel={`Filter by ${item}`}
          >
            <Text style={[styles.filterChipText, activeCategory === item && styles.filterChipTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Summary */}
      <View style={styles.summaryBar}>
        <Text style={styles.summaryText}>
          {filtered.length} expense{filtered.length !== 1 ? 's' : ''}
        </Text>
        <Text style={styles.summaryTotal}>{formatCurrency(totalShown)}</Text>
      </View>

      {/* Error */}
      {error !== '' && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️  {error}</Text>
        </View>
      )}

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No expenses found.</Text>
            <Text style={styles.emptySubText}>
              {search || activeCategory !== 'All'
                ? 'Try adjusting your search or filter.'
                : 'Tap "+" to add your first expense.'}
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddExpense')}
        accessibilityRole="button"
        accessibilityLabel="Add new expense"
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  loadingText: { marginTop: SPACING.md, color: COLORS.textSecondary },
  searchContainer: { padding: SPACING.md, paddingBottom: 0 },
  searchInput: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.small,
  },
  filterList: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.xs,
  },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterChipText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, fontWeight: '500' },
  filterChipTextActive: { color: COLORS.white, fontWeight: '700' },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.primaryLight,
  },
  summaryText: { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: '600' },
  summaryTotal: { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: '700' },
  errorBanner: { backgroundColor: COLORS.dangerLight, margin: SPACING.md, borderRadius: RADIUS.sm, padding: SPACING.md, borderLeftWidth: 4, borderLeftColor: COLORS.danger },
  errorText: { color: COLORS.danger, fontSize: FONTS.sizes.sm },
  listContent: { padding: SPACING.md, paddingBottom: 80 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOW.small,
    overflow: 'hidden',
  },
  cardTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  categoryBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  categoryBadgeText: { color: COLORS.white, fontSize: FONTS.sizes.lg, fontWeight: '700' },
  cardBody: { flex: 1 },
  expenseName: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.textPrimary },
  expenseMeta: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: 2 },
  expenseDesc: { fontSize: FONTS.sizes.xs, color: COLORS.textDisabled, marginTop: 2 },
  cardRight: { alignItems: 'flex-end' },
  expenseAmount: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.danger },
  deleteBtn: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, justifyContent: 'center', alignItems: 'center' },
  deleteBtnText: { fontSize: 20 },
  emptyBox: { alignItems: 'center', paddingVertical: SPACING.xxl },
  emptyIcon: { fontSize: 48, marginBottom: SPACING.md },
  emptyText: { fontSize: FONTS.sizes.lg, fontWeight: '600', color: COLORS.textSecondary },
  emptySubText: { fontSize: FONTS.sizes.sm, color: COLORS.textDisabled, marginTop: SPACING.xs, textAlign: 'center' },
  fab: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW.medium,
  },
  fabText: { color: COLORS.white, fontSize: 28, fontWeight: '300', lineHeight: 32 },
});

export default ExpensesScreen;
