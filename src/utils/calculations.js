/**
 * ============================================================
 * FILE: src/utils/calculations.js
 * ============================================================
 *
 * PURPOSE:
 *   Pure helper functions that derive computed values from the
 *   raw transactions array stored in global state.
 *
 * DESIGN PRINCIPLES:
 *   1. Pure — no side effects, no external dependencies, no React.
 *   2. Single-responsibility — each function answers one question.
 *   3. Easy to unit-test: import a function, pass mock data, assert.
 *
 * USAGE PATTERN:
 *   Components import only the functions they need and call them
 *   inside the render cycle (or inside useMemo for performance):
 *
 *     import { getTotalIncome, getCategoryExpenses } from '../utils/calculations';
 *     const income  = getTotalIncome(state.transactions);
 *     const catData = getCategoryExpenses(state.transactions);
 * ============================================================
 */


/* ----------------------------------------------------------------
 * FORMATTING HELPERS
 * ---------------------------------------------------------------- */

/**
 * Formats a number as a USD currency string with no decimals.
 * Examples: 1234.5 → "$1,235"   |   0 → "$0"
 *
 * Using Intl.NumberFormat is preferred over manual string manipulation
 * because it handles locale-specific separators automatically.
 *
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats an ISO date string "YYYY-MM-DD" into a human-readable
 * label like "Mar 15, 2026".
 *
 * The "+T00:00" suffix forces UTC midnight so the date is not
 * shifted by the user's local timezone offset.
 *
 * @param {string} isoDate  - "YYYY-MM-DD"
 * @returns {string}
 */
export function formatDate(isoDate) {
  return new Date(isoDate + "T00:00").toLocaleDateString("en-US", {
    month: "short",
    day:   "numeric",
    year:  "numeric",
  });
}

/**
 * Generates a reasonably unique ID for a new transaction.
 * Combines the current timestamp (ms) with a random integer so
 * that two transactions created within the same millisecond still
 * get different IDs.
 *
 * In a production app backed by a database you would use UUID v4
 * or a server-generated ID instead.
 *
 * @returns {string}  e.g. "t17428451234789"
 */
export function generateId() {
  return "t" + Date.now() + Math.floor(Math.random() * 10_000);
}


/* ----------------------------------------------------------------
 * AGGREGATE CALCULATIONS
 * ---------------------------------------------------------------- */

/**
 * getTotalIncome
 * Returns the sum of all income transaction amounts.
 *
 * Algorithm:
 *   1. Filter: keep only transactions where type === "income".
 *   2. Reduce: sum the amount fields, starting from 0.
 *
 * @param {Array} transactions  - Full transactions array from state.
 * @returns {number}
 */
export function getTotalIncome(transactions) {
  return transactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);
}

/**
 * getTotalExpense
 * Returns the sum of all expense transaction amounts.
 *
 * @param {Array} transactions  - Full transactions array from state.
 * @returns {number}
 */
export function getTotalExpense(transactions) {
  return transactions
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0);
}

/**
 * getBalance
 * Returns income minus expenses (positive = surplus, negative = deficit).
 *
 * @param {Array} transactions
 * @returns {number}
 */
export function getBalance(transactions) {
  return getTotalIncome(transactions) - getTotalExpense(transactions);
}

/**
 * getSavingsRate
 * Returns what percentage of income was saved (not spent).
 * Returns 0 if there is no income to avoid division-by-zero.
 *
 * @param {Array} transactions
 * @returns {number}  0-100 (integer)
 */
export function getSavingsRate(transactions) {
  const income  = getTotalIncome(transactions);
  const expense = getTotalExpense(transactions);
  if (income === 0) return 0;
  return Math.round(((income - expense) / income) * 100);
}


/* ----------------------------------------------------------------
 * CATEGORY-LEVEL CALCULATIONS
 * ---------------------------------------------------------------- */

/**
 * getCategoryExpenses
 * Aggregates total spending per expense category.
 *
 * Returns a plain object where each key is a category name and
 * the value is the summed amount.  Only expense transactions are
 * included — income categories are ignored here.
 *
 * Example output:
 *   { Food: 700, Rent: 1200, Transport: 225 }
 *
 * @param {Array} transactions
 * @returns {Object.<string, number>}
 */
export function getCategoryExpenses(transactions) {
  return transactions
    .filter((tx) => tx.type === "expense")
    .reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {});
}

/**
 * getCategoryExpensesArray
 * Converts the getCategoryExpenses object into a sorted array
 * suitable for Recharts (PieChart / BarChart).
 *
 * Example output:
 *   [ { name: "Rent", value: 1200 }, { name: "Food", value: 700 }, ... ]
 *
 * Sorted descending by value so the largest segments appear first.
 *
 * @param {Array} transactions
 * @returns {Array<{ name: string, value: number }>}
 */
export function getCategoryExpensesArray(transactions) {
  const map = getCategoryExpenses(transactions);
  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}


/* ----------------------------------------------------------------
 * TIME-SERIES CALCULATIONS
 * ---------------------------------------------------------------- */

/**
 * getMonthlyExpenses
 * Groups total expenses by calendar month.
 *
 * Returns an array of { month: "YYYY-MM", total: number } objects
 * sorted chronologically.  Used for month-over-month analysis.
 *
 * @param {Array} transactions
 * @returns {Array<{ month: string, total: number }>}
 */
export function getMonthlyExpenses(transactions) {
  const map = {};
  transactions
    .filter((tx) => tx.type === "expense")
    .forEach((tx) => {
      const month = tx.date.slice(0, 7); // "YYYY-MM"
      map[month] = (map[month] || 0) + tx.amount;
    });

  return Object.entries(map)
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

/**
 * getMonthlyData
 * Builds a combined income-and-expense series per calendar month.
 * This is the primary data source for the MonthlyLineChart component.
 *
 * Each object in the returned array has:
 *   month   – "YYYY-MM" (for sorting / keying)
 *   label   – "Mar '26" (human-readable X-axis label)
 *   income  – total income for the month
 *   expense – total expenses for the month
 *
 * Algorithm:
 *   1. Walk every transaction and accumulate into a month-keyed map.
 *   2. Convert the map to a sorted array.
 *   3. Attach a human-readable label.
 *
 * @param {Array} transactions
 * @returns {Array<{ month: string, label: string, income: number, expense: number }>}
 */
export function getMonthlyData(transactions) {
  const map = {};

  transactions.forEach((tx) => {
    const month = tx.date.slice(0, 7);
    if (!map[month]) {
      map[month] = { month, income: 0, expense: 0 };
    }
    map[month][tx.type] += tx.amount;
  });

  return Object.values(map)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((entry) => ({
      ...entry,
      label: new Date(entry.month + "-02").toLocaleDateString("en-US", {
        month: "short",
        year:  "2-digit",
      }),
    }));
}

/**
 * getBudgetStatus
 * Joins the budgets array with actual spending data so each budget
 * entry is enriched with: spent, remaining, percentage, overBudget.
 *
 * This is the primary data source for the BudgetCard component.
 *
 * @param {Array} transactions  - Full transactions from state.
 * @param {Array} budgets       - Full budgets from state.
 * @returns {Array<{
 *   category  : string,
 *   limit     : number,
 *   spent     : number,
 *   remaining : number,
 *   pct       : number,   0-100 (capped at 100 for the progress bar)
 *   overBudget: boolean,
 * }>}
 */
export function getBudgetStatus(transactions, budgets) {
  const catExp = getCategoryExpenses(transactions);

  return budgets.map((budget) => {
    const spent     = catExp[budget.category] || 0;
    const remaining = budget.limit - spent;
    const pct       = Math.min((spent / budget.limit) * 100, 100);

    return {
      category:   budget.category,
      limit:      budget.limit,
      spent,
      remaining,
      pct:        Math.round(pct),
      overBudget: spent > budget.limit,
    };
  });
}
