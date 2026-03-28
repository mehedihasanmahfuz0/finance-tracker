/**
 * ============================================================
 * FILE: src/data/initialState.js
 * ============================================================
 *
 * PURPOSE:
 *   Defines the *shape* and *seed data* for the global state tree.
 *   Separating this from the context file means:
 *     • The shape is documented in one place.
 *     • In tests you can import it directly to reset state.
 *     • It could be replaced by a localStorage.getItem() call if
 *       you want to persist state across page refreshes.
 *
 * STATE SHAPE:
 * {
 *   transactions : Transaction[]   — all income & expense records
 *   budgets      : Budget[]        — per-category spending limits
 *   filters      : FilterConfig    — active UI filters
 * }
 *
 * Transaction {
 *   id          : string   — unique identifier (generated in component)
 *   type        : "income" | "expense"
 *   amount      : number   — positive value (never negative)
 *   category    : string   — e.g. "Food", "Salary"
 *   date        : string   — ISO 8601 date "YYYY-MM-DD"
 *   description : string   — optional free-text note
 * }
 *
 * Budget {
 *   category : string  — must match a Transaction category
 *   limit    : number  — monthly spending ceiling in dollars
 * }
 *
 * FilterConfig {
 *   category : string  — "all" | any category name
 *   type     : string  — "all" | "income" | "expense"
 *   sortBy   : string  — "date" | "amount"
 * }
 * ============================================================
 */

/** @type {import('../types').AppState} */
const initialState = {
  /* ---------------------------------------------------------
   * TRANSACTIONS
   * Seed data covers three months so the monthly trend chart
   * has meaningful data on first load.
   * --------------------------------------------------------- */
  transactions: [
    // ── March 2026 ──────────────────────────────────────────
    {
      id: "t1",
      type: "income",
      amount: 5000,
      category: "Salary",
      date: "2026-03-01",
      description: "Monthly salary - March",
    },
    {
      id: "t2",
      type: "expense",
      amount: 1200,
      category: "Rent",
      date: "2026-03-02",
      description: "Monthly apartment rent",
    },
    {
      id: "t3",
      type: "expense",
      amount: 280,
      category: "Food",
      date: "2026-03-05",
      description: "Groceries & dining out",
    },
    {
      id: "t4",
      type: "income",
      amount: 850,
      category: "Freelance",
      date: "2026-03-08",
      description: "Web design project",
    },
    {
      id: "t5",
      type: "expense",
      amount: 120,
      category: "Entertainment",
      date: "2026-03-10",
      description: "Streaming services & games",
    },
    {
      id: "t6",
      type: "expense",
      amount: 85,
      category: "Transport",
      date: "2026-03-12",
      description: "Monthly bus pass",
    },
    {
      id: "t7",
      type: "expense",
      amount: 310,
      category: "Shopping",
      date: "2026-03-14",
      description: "Clothes & accessories",
    },
    {
      id: "t8",
      type: "expense",
      amount: 180,
      category: "Health",
      date: "2026-03-15",
      description: "Gym membership + vitamins",
    },
    // ── February 2026 ────────────────────────────────────────
    {
      id: "t9",
      type: "income",
      amount: 200,
      category: "Investment",
      date: "2026-02-20",
      description: "Dividend payout",
    },
    {
      id: "t10",
      type: "expense",
      amount: 420,
      category: "Food",
      date: "2026-02-18",
      description: "Groceries - February",
    },
    {
      id: "t11",
      type: "expense",
      amount: 1200,
      category: "Rent",
      date: "2026-02-02",
      description: "February apartment rent",
    },
    {
      id: "t12",
      type: "income",
      amount: 5000,
      category: "Salary",
      date: "2026-02-01",
      description: "Monthly salary - February",
    },
    {
      id: "t13",
      type: "expense",
      amount: 95,
      category: "Utilities",
      date: "2026-02-10",
      description: "Electricity bill",
    },
    {
      id: "t14",
      type: "expense",
      amount: 200,
      category: "Education",
      date: "2026-02-22",
      description: "Online programming course",
    },
    // ── January 2026 ─────────────────────────────────────────
    {
      id: "t15",
      type: "income",
      amount: 400,
      category: "Freelance",
      date: "2026-01-28",
      description: "Logo design project",
    },
    {
      id: "t16",
      type: "expense",
      amount: 1200,
      category: "Rent",
      date: "2026-01-02",
      description: "January apartment rent",
    },
    {
      id: "t17",
      type: "income",
      amount: 5000,
      category: "Salary",
      date: "2026-01-01",
      description: "Monthly salary - January",
    },
    {
      id: "t18",
      type: "expense",
      amount: 350,
      category: "Food",
      date: "2026-01-15",
      description: "Groceries - January",
    },
    {
      id: "t19",
      type: "expense",
      amount: 140,
      category: "Transport",
      date: "2026-01-20",
      description: "Fuel & parking fees",
    },
    {
      id: "t20",
      type: "expense",
      amount: 75,
      category: "Entertainment",
      date: "2026-01-25",
      description: "Cinema trips",
    },
  ],

  /* ---------------------------------------------------------
   * BUDGETS
   * Monthly spending ceilings per category.
   * The BudgetSection component reads these to render progress
   * bars showing how close the user is to each limit.
   * --------------------------------------------------------- */
  budgets: [
    { category: "Food",          limit: 500  },
    { category: "Rent",          limit: 1500 },
    { category: "Entertainment", limit: 200  },
    { category: "Transport",     limit: 150  },
    { category: "Shopping",      limit: 400  },
    { category: "Health",        limit: 300  },
    { category: "Education",     limit: 250  },
    { category: "Utilities",     limit: 150  },
  ],

  /* ---------------------------------------------------------
   * FILTERS
   * Default filter state — show everything, newest first.
   * The TransactionList component reads these to filter/sort
   * the transactions array before rendering.
   * --------------------------------------------------------- */
  filters: {
    category: "all",   // "all" means no category filter is active
    type:     "all",   // "all" | "income" | "expense"
    sortBy:   "date",  // "date" (newest first) | "amount" (highest first)
  },
};

export default initialState;
