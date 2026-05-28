/**
 * formatters.js
 * Utility functions for formatting currency, dates, etc.
 */

/**
 * Format a number as Rwandan Francs.
 */
export const formatCurrency = (amount) => {
  const num = parseFloat(amount) || 0;
  return `${num.toLocaleString('en-RW')} RWF`;
};

/**
 * Format an ISO date string to a readable format.
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Get today's date as YYYY-MM-DD string.
 */
export const todayString = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

/**
 * Calculate percentage, capped at 100.
 */
export const calcPercent = (spent, budget) => {
  if (!budget || budget === 0) return 0;
  return Math.min(100, Math.round((spent / budget) * 100));
};

/**
 * Get a colour based on budget usage percentage.
 */
export const budgetColor = (pct) => {
  if (pct >= 100) return '#e53935'; // red
  if (pct >= 80) return '#fb8c00';  // orange
  if (pct >= 50) return '#fdd835';  // yellow
  return '#43a047';                  // green
};
