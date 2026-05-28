/**
 * storage.js
 * Local AsyncStorage-based data layer.
 * Simulates a RESTful API (GET, POST, DELETE) for users and expenses.
 * Seeded with sample users matching the project specification.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_KEY = '@finance_tracker_users';
const EXPENSES_KEY = '@finance_tracker_expenses';
const SEEDED_KEY = '@finance_tracker_seeded';

// ─── Seed Data ────────────────────────────────────────────────────────────────
const SEED_USERS = [
  {
    id: '1',
    username: 'admin@finance.com',
    password: 'Admin@1234',
    createdAt: new Date().toISOString(),
    budgets: [
      { category: 'Transportation', amount: 100000, period: 'Monthly' },
      { category: 'Food', amount: 200000, period: 'Monthly' },
      { category: 'Housing', amount: 200000, period: 'Monthly' },
      { category: 'Entertainment', amount: 50000, period: 'Monthly' },
      { category: 'Healthcare', amount: 80000, period: 'Monthly' },
    ],
    budget: 630000,
  },
  {
    id: '2',
    username: 'john@example.com',
    password: 'John@5678',
    createdAt: new Date().toISOString(),
    budgets: [
      { category: 'Food', amount: 150000, period: 'Monthly' },
      { category: 'Transportation', amount: 60000, period: 'Monthly' },
    ],
    budget: 210000,
  },
  {
    id: '3',
    username: 'jane@example.com',
    password: 'Jane@9012',
    createdAt: new Date().toISOString(),
    budgets: [
      { category: 'Housing', amount: 300000, period: 'Monthly' },
      { category: 'Food', amount: 100000, period: 'Monthly' },
    ],
    budget: 400000,
  },
];

const SEED_EXPENSES = [
  {
    id: '1',
    name: 'Grocery Shopping',
    amount: 45000,
    description: 'Weekly groceries from Nakumatt',
    category: 'Food',
    date: '2026-05-01',
    userId: '1',
    createdAt: new Date('2026-05-01').toISOString(),
  },
  {
    id: '2',
    name: 'Bus Pass',
    amount: 15000,
    description: 'Monthly bus pass',
    category: 'Transportation',
    date: '2026-05-02',
    userId: '1',
    createdAt: new Date('2026-05-02').toISOString(),
  },
  {
    id: '3',
    name: 'Electricity Bill',
    amount: 30000,
    description: 'Monthly electricity bill',
    category: 'Housing',
    date: '2026-05-05',
    userId: '1',
    createdAt: new Date('2026-05-05').toISOString(),
  },
  {
    id: '4',
    name: 'Cinema Tickets',
    amount: 12000,
    description: 'Movie night with family',
    category: 'Entertainment',
    date: '2026-05-10',
    userId: '1',
    createdAt: new Date('2026-05-10').toISOString(),
  },
  {
    id: '5',
    name: 'Doctor Visit',
    amount: 25000,
    description: 'General check-up',
    category: 'Healthcare',
    date: '2026-05-15',
    userId: '1',
    createdAt: new Date('2026-05-15').toISOString(),
  },
];

// ─── Initialise / Seed ────────────────────────────────────────────────────────
export const initStorage = async () => {
  try {
    const seeded = await AsyncStorage.getItem(SEEDED_KEY);
    if (!seeded) {
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(SEED_USERS));
      await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(SEED_EXPENSES));
      await AsyncStorage.setItem(SEEDED_KEY, 'true');
    }
  } catch (error) {
    console.error('Storage init error:', error);
  }
};

// ─── User Helpers ─────────────────────────────────────────────────────────────
const getUsers = async () => {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
};

const saveUsers = async (users) => {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// ─── Expense Helpers ──────────────────────────────────────────────────────────
const getExpenses = async () => {
  const raw = await AsyncStorage.getItem(EXPENSES_KEY);
  return raw ? JSON.parse(raw) : [];
};

const saveExpenses = async (expenses) => {
  await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
};

// ─── User API ─────────────────────────────────────────────────────────────────

/**
 * GET /users?username=xxx
 * Returns the user matching the given username, or null.
 */
export const getUserByUsername = async (username) => {
  const users = await getUsers();
  return users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  ) || null;
};

/**
 * GET /users/:id
 */
export const getUserById = async (id) => {
  const users = await getUsers();
  return users.find((u) => u.id === id) || null;
};

/**
 * PUT /users/:id  – update budget fields
 */
export const updateUser = async (id, updates) => {
  const users = await getUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) throw new Error('User not found');
  users[idx] = { ...users[idx], ...updates };
  await saveUsers(users);
  return users[idx];
};

// ─── Expense API ──────────────────────────────────────────────────────────────

/**
 * GET /expenses
 * Returns all expenses (optionally filtered by userId).
 */
export const getAllExpenses = async (userId = null) => {
  const expenses = await getExpenses();
  if (userId) return expenses.filter((e) => e.userId === userId);
  return expenses;
};

/**
 * GET /expenses/:id
 */
export const getExpenseById = async (id) => {
  const expenses = await getExpenses();
  return expenses.find((e) => e.id === id) || null;
};

/**
 * POST /expenses
 */
export const createExpense = async (data) => {
  const expenses = await getExpenses();
  const newExpense = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    ...data,
  };
  expenses.push(newExpense);
  await saveExpenses(expenses);
  return newExpense;
};

/**
 * PUT /expenses/:id
 */
export const updateExpense = async (id, updates) => {
  const expenses = await getExpenses();
  const idx = expenses.findIndex((e) => e.id === id);
  if (idx === -1) throw new Error('Expense not found');
  expenses[idx] = { ...expenses[idx], ...updates };
  await saveExpenses(expenses);
  return expenses[idx];
};

/**
 * DELETE /expenses/:id
 */
export const deleteExpense = async (id) => {
  const expenses = await getExpenses();
  const filtered = expenses.filter((e) => e.id !== id);
  if (filtered.length === expenses.length) throw new Error('Expense not found');
  await saveExpenses(filtered);
  return { success: true, id };
};
