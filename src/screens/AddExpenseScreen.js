/**
 * AddExpenseScreen.js
 * Task 2 – User creates a new expense using POST /expenses.
 * Full form validation, category picker, date input.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { addExpense } from '../services/api';
import { validateExpense, isValid } from '../utils/validation';
import { todayString } from '../utils/formatters';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW, CATEGORIES } from '../constants/theme';

const AddExpenseScreen = ({ navigation }) => {
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: '',
    amount: '',
    category: '',
    date: todayString(),
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    if (apiError) setApiError('');
  };

  const handleSubmit = async () => {
    const validationErrors = validateExpense(form);
    if (!isValid(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setApiError('');
    try {
      const payload = {
        name: form.name.trim(),
        amount: parseFloat(form.amount),
        category: form.category,
        date: form.date,
        description: form.description.trim(),
        userId: user?.id,
      };
      const res = await addExpense(payload);
      // Navigate straight to the expenses list — useFocusEffect will refresh it
      navigation.navigate('Expenses');
    } catch (err) {
      setApiError(err.message || 'Failed to add expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* API Error */}
        {apiError !== '' && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>⚠️  {apiError}</Text>
          </View>
        )}

        {/* Name */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Expense Name *</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="e.g. Grocery Shopping"
            placeholderTextColor={COLORS.textDisabled}
            value={form.name}
            onChangeText={(v) => handleChange('name', v)}
            returnKeyType="next"
            accessibilityLabel="Expense name"
          />
          {errors.name ? <Text style={styles.fieldError}>{errors.name}</Text> : null}
        </View>

        {/* Amount */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Amount (RWF) *</Text>
          <TextInput
            style={[styles.input, errors.amount && styles.inputError]}
            placeholder="e.g. 15000"
            placeholderTextColor={COLORS.textDisabled}
            value={form.amount}
            onChangeText={(v) => handleChange('amount', v)}
            keyboardType="numeric"
            returnKeyType="next"
            accessibilityLabel="Expense amount"
          />
          {errors.amount ? <Text style={styles.fieldError}>{errors.amount}</Text> : null}
        </View>

        {/* Category */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Category *</Text>
          <View style={[styles.categoryGrid, errors.category && styles.categoryGridError]}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.catChip, form.category === cat && styles.catChipActive]}
                onPress={() => handleChange('category', cat)}
                accessibilityLabel={`Select category ${cat}`}
              >
                <Text style={[styles.catChipText, form.category === cat && styles.catChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.category ? <Text style={styles.fieldError}>{errors.category}</Text> : null}
        </View>

        {/* Date */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Date *</Text>
          <TextInput
            style={[styles.input, errors.date && styles.inputError]}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={COLORS.textDisabled}
            value={form.date}
            onChangeText={(v) => handleChange('date', v)}
            keyboardType="numbers-and-punctuation"
            returnKeyType="next"
            accessibilityLabel="Expense date"
          />
          {errors.date ? <Text style={styles.fieldError}>{errors.date}</Text> : null}
        </View>

        {/* Description */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Description (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea, errors.description && styles.inputError]}
            placeholder="Add a note about this expense…"
            placeholderTextColor={COLORS.textDisabled}
            value={form.description}
            onChangeText={(v) => handleChange('description', v)}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            returnKeyType="done"
            accessibilityLabel="Expense description"
          />
          <Text style={styles.charCount}>{form.description.length}/200</Text>
          {errors.description ? <Text style={styles.fieldError}>{errors.description}</Text> : null}
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Save expense"
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <Text style={styles.submitBtnText}>💾  Save Expense</Text>
          )}
        </TouchableOpacity>

        {/* Cancel */}
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  errorBanner: {
    backgroundColor: COLORS.dangerLight,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.danger,
  },
  errorBannerText: { color: COLORS.danger, fontSize: FONTS.sizes.sm, fontWeight: '500' },
  fieldGroup: { marginBottom: SPACING.md },
  label: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.textPrimary, marginBottom: SPACING.xs },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.white,
  },
  inputError: { borderColor: COLORS.danger, backgroundColor: COLORS.dangerLight },
  textArea: { height: 90, paddingTop: SPACING.sm },
  charCount: { fontSize: FONTS.sizes.xs, color: COLORS.textDisabled, textAlign: 'right', marginTop: 2 },
  fieldError: { color: COLORS.danger, fontSize: FONTS.sizes.xs, marginTop: SPACING.xs },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    padding: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.white,
  },
  categoryGridError: { borderColor: COLORS.danger, backgroundColor: COLORS.dangerLight },
  catChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catChipText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, fontWeight: '500' },
  catChipTextActive: { color: COLORS.white, fontWeight: '700' },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
    ...SHADOW.small,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: COLORS.white, fontSize: FONTS.sizes.lg, fontWeight: '700' },
  cancelBtn: {
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  cancelBtnText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md, fontWeight: '600' },
});

export default AddExpenseScreen;
