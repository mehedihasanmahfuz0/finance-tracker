/**
 * ============================================================
 * FILE: src/App.jsx
 * ============================================================
 *
 * PURPOSE:
 *   The application root.  This is the boundary between:
 *     • Provider / infrastructure layer  (FinanceProvider)
 *     • Application / UI layer           (HomePage)
 *
 * WHY THIS SEPARATION?
 *   Wrapping HomePage inside FinanceProvider here (instead of
 *   inside main.jsx) means:
 *     a) main.jsx stays clean — it only mounts React.
 *     b) If you add more providers later (router, theme, auth),
 *        you compose them all in App.jsx in a single visible place.
 *     c) It is easy to test HomePage in isolation by swapping the
 *        provider for a mock in tests.
 *
 * COMPONENT TREE PRODUCED:
 *   <App>
 *     <FinanceProvider>       ← creates the useReducer state + Context
 *       <HomePage>            ← tab shell + routing
 *         <Dashboard>
 *         <TransactionForm>
 *         <TransactionList>
 *           <TransactionItem> (×n)
 *         <BudgetSection>
 *           <BudgetCard>      (×n)
 *         <Charts>
 *           <MonthlyLineChart>
 *           <ExpensePieChart>
 *       </HomePage>
 *     </FinanceProvider>
 *   </App>
 * ============================================================
 */

import React          from "react";
import { FinanceProvider } from "./context/FinanceContext";
import HomePage       from "./pages/HomePage";
import "./index.css";          // Global stylesheet (design tokens + layout)

function App() {
  return (
    /*
     * FinanceProvider must wrap everything that uses useFinance().
     * If any consumer is rendered outside this boundary,
     * useFinance() will throw a descriptive error.
     */
    <FinanceProvider>
      <HomePage />
    </FinanceProvider>
  );
}

export default App;
