/**
 * validation.js
 * Input validation helpers used across the app.
 */

/**
 * Validate login form fields.
 * Returns an object with field-level error messages.
 */
export const validateLogin = ({ username, password }) => {
  const errors = {};

  if (!username || username.trim() === '') {
    errors.username = 'Username (email) is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username.trim())) {
    errors.username = 'Please enter a valid email address.';
  }

  if (!password || password.trim() === '') {
    errors.password = 'Password is required.';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }

  return errors;
};

/**
 * Validate expense form fields.
 */
export const validateExpense = ({ name, amount, category, date, description }) => {
  const errors = {};

  if (!name || name.trim() === '') {
    errors.name = 'Expense name is required.';
  } else if (name.trim().length < 2) {
    errors.name = 'Expense name must be at least 2 characters.';
  }

  if (amount === undefined || amount === null || amount === '') {
    errors.amount = 'Amount is required.';
  } else if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
    errors.amount = 'Amount must be a positive number.';
  }

  if (!category || category.trim() === '') {
    errors.category = 'Category is required.';
  }

  if (!date || date.trim() === '') {
    errors.date = 'Date is required.';
  } else {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      errors.date = 'Please enter a valid date (YYYY-MM-DD).';
    }
  }

  if (description && description.length > 200) {
    errors.description = 'Description must be 200 characters or fewer.';
  }

  return errors;
};

/**
 * Returns true if the errors object has no keys.
 */
export const isValid = (errors) => Object.keys(errors).length === 0;
