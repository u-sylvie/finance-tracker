/**
 * BudgetScreen.js
 * Displays and allows editing of the user's budget allocations per category.
 * Saves budgets array + total budget back to MockAPI via PUT /users/:id
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { updateUserBudget } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW, CATEGORIES, CATEGORY_COLORS } from '../constants/theme';

const BudgetScreen = ({ navigation }) => {
  const { user, refreshUser } = useAuth();

  // Build editable budget map from user.budgets array (if it exists and is valid)
  const buildBudgetMap = () => {
    const map = {};
    CATEGORIES.forEach((cat) => { map[cat] = ''; });

    const budgets = user?.budgets;
    // Only use budgets if it's a proper array of objects with category+amount
    if (Array.isArray(budgets) && budgets.length > 0 && typeof budgets[0] === 'object') {
      budgets.forEach((b) => {
        if (b.category && b.amount !== undefined) {
          map[b.category] = String(b.amount);
        }
      });
    }
    return map;
  };

  const [budgetMap, setBudgetMap] = useState(buildBudgetMap);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (cat, value) => {
    setBudgetMap((prev) => ({ ...prev, [cat]: value }));
    if (errors[cat]) setErrors((prev) => ({ ...prev, [cat]: '' }));
    if (apiError) setApiError('');
  };

  const validate = () => {
    const errs = {};
    Object.entries(budgetMap).forEach(([cat, val]) => {
      if (val !== '' && (isNaN(parseFloat(val)) || parseFloat(val) < 0)) {
        errs[cat] = 'Must be a positive number or leave empty.';
      }
    });
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setApiError('');
    setSuccessMsg('');
    try {
      // Build budgets array from filled-in categories only
      const budgets = Object.entries(budgetMap)
        .filter(([, val]) => val !== '' && parseFloat(val) > 0)
        .map(([category, amount]) => ({
          category,
          amount: parseFloat(amount),
          period: 'Monthly',
        }));

      const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);

      // PUT /users/:id with updated budgets
      const res = await updateUserBudget(user.id, { budgets, budget: totalBudget });
      refreshUser(res.data);
      // Navigate to Dashboard so it reloads with the new budget
      navigation.navigate('Dashboard');
    } catch (err) {
      setApiError(err.message || 'Failed to save budget. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalBudget = Object.values(budgetMap)
    .filter((v) => v !== '' && !isNaN(parseFloat(v)))
    .reduce((s, v) => s + parseFloat(v), 0);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>Monthly Budget</Text>
        <Text style={styles.headerTotal}>{formatCurrency(totalBudget)}</Text>
        <Text style={styles.headerSub}>Total allocated across all categories</Text>
      </View>

      {/* Error */}
      {apiError !== '' && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️  {apiError}</Text>
        </View>
      )}

      {/* Budget Inputs */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Set Budget per Category</Text>
        <Text style={styles.cardSubtitle}>Enter monthly amount in RWF. Leave empty to skip.</Text>

        {CATEGORIES.map((cat) => (
          <View key={cat} style={styles.budgetRow}>
            <View style={[styles.catDot, { backgroundColor: CATEGORY_COLORS[cat] || COLORS.textSecondary }]} />
            <View style={styles.budgetField}>
              <Text style={styles.catLabel}>{cat}</Text>
              <TextInput
                style={[styles.input, errors[cat] && styles.inputError]}
                value={budgetMap[cat]}
                onChangeText={(v) => handleChange(cat, v)}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={COLORS.textDisabled}
                accessibilityLabel={`Budget for ${cat}`}
              />
              {errors[cat] ? <Text style={styles.fieldError}>{errors[cat]}</Text> : null}
            </View>
            <Text style={styles.currency}>RWF</Text>
          </View>
        ))}
      </View>

      {/* Save */}
      <TouchableOpacity
        style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel="Save budget"
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} size="small" />
        ) : (
          <Text style={styles.saveBtnText}>💾  Save Budget</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  headerCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOW.medium,
  },
  headerTitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerTotal: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xxxl,
    fontWeight: '700',
    marginTop: SPACING.xs,
  },
  headerSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: FONTS.sizes.xs,
    marginTop: SPACING.xs,
  },
  errorBanner: {
    backgroundColor: COLORS.dangerLight,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.danger,
  },
  errorText: { color: COLORS.danger, fontSize: FONTS.sizes.sm },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOW.small,
  },
  cardTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  cardSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  catDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
  budgetField: { flex: 1 },
  catLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs + 2,
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.background,
  },
  inputError: { borderColor: COLORS.danger, backgroundColor: COLORS.dangerLight },
  fieldError: { color: COLORS.danger, fontSize: FONTS.sizes.xs, marginTop: 2 },
  currency: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    ...SHADOW.small,
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { color: COLORS.white, fontSize: FONTS.sizes.lg, fontWeight: '700' },
});

export default BudgetScreen;
