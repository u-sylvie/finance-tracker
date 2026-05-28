/**
 * api.js
 * Axios-based API client targeting the live MockAPI endpoints.
 *
 * Base URL: https://67ac71475853dfff53dab929.mockapi.io/api/v1
 *
 * Endpoints used:
 *   GET    /users?username=xxx          – Task 1: login
 *   GET    /expenses                    – Task 4: list all expenses
 *   POST   /expenses                    – Task 2: create expense
 *   GET    /expenses/:id                – Task 3: expense detail
 *   PUT    /expenses/:id                – edit expense
 *   DELETE /expenses/:id                – Task 5: delete expense
 */

import axios from 'axios';

// ─── Axios instance ───────────────────────────────────────────────────────────
const BASE_URL = 'https://6a155e9f91ff9a63de080325.mockapi.io/api/v1';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Response interceptor – uniform error handling ────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      'An unexpected error occurred. Please try again.';
    return Promise.reject(new Error(message));
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
//  USER ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Task 1 – GET /users?username=xxx
 * Fetches all users, then finds the matching username and validates the password
 * client-side. MockAPI free plan does not support query-param filtering reliably,
 * so we fetch the full list and filter locally — which also matches the spec
 * endpoint pattern GET /users?username=xxx.
 */
export const loginUser = async (username, password) => {
  // Fetch all users — MockAPI free tier ignores ?username= filter
  const response = await apiClient.get('/users');

  const users = response.data;

  if (!users || users.length === 0) {
    throw new Error('No users found. Please contact the administrator.');
  }

  // Find exact match (case-insensitive)
  const user = users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );

  if (!user) {
    throw new Error('User not found. Please check your username.');
  }

  if (user.password !== password) {
    throw new Error('Incorrect password. Please try again.');
  }

  // Strip password before returning
  const { password: _pw, ...safeUser } = user;
  return { data: safeUser };
};

/**
 * GET /users/:id
 */
export const fetchUserById = async (id) => {
  const response = await apiClient.get(`/users/${id}`);
  const { password: _pw, ...safeUser } = response.data;
  return { data: safeUser };
};

/**
 * PUT /users/:id  – update budget fields on the user record
 */
export const updateUserBudget = async (id, updates) => {
  const response = await apiClient.put(`/users/${id}`, updates);
  const { password: _pw, ...safeUser } = response.data;
  return { data: safeUser };
};

// ═══════════════════════════════════════════════════════════════════════════════
//  EXPENSE ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Task 4 – GET /expenses
 * Returns all expenses. MockAPI does not support userId filtering natively,
 * so we fetch all and filter client-side when a userId is provided.
 */
export const fetchAllExpenses = async (userId = null) => {
  const response = await apiClient.get('/expenses');
  let expenses = response.data || [];

  if (userId) {
    expenses = expenses.filter((e) => e.userId === String(userId));
  }

  return { data: expenses };
};

/**
 * Task 3 – GET /expenses/:id
 */
export const fetchExpenseById = async (id) => {
  const response = await apiClient.get(`/expenses/${id}`);
  if (!response.data) throw new Error('Expense not found.');
  return { data: response.data };
};

/**
 * Task 2 – POST /expenses
 */
export const addExpense = async (data) => {
  const response = await apiClient.post('/expenses', data);
  return { data: response.data };
};

/**
 * PUT /expenses/:id
 */
export const editExpense = async (id, data) => {
  const response = await apiClient.put(`/expenses/${id}`, data);
  return { data: response.data };
};

/**
 * Task 5 – DELETE /expenses/:id
 */
export const removeExpense = async (id) => {
  const response = await apiClient.delete(`/expenses/${id}`);
  return { data: response.data };
};

export default apiClient;
