/**
 * ============================================================
 * FILE: src/components/dashboard/IncomeCard.jsx
 * ============================================================
 *
 * PURPOSE:
 *   A small "metric card" that highlights the total income figure
 *   alongside a count of income-type transactions.
 *
 * PROPS:
 *   total {number}  – sum of all income transactions
 *   count {number}  – number of income transactions
 *
 * NOTE:
 *   This is intentionally a "presentational" (dumb) component —
 *   it receives computed values as props and only handles rendering.
 *   All data derivation happens in Dashboard.jsx.
 * ============================================================
 */

import React from "react";
import { formatCurrency } from "../../utils/calculations";

export function IncomeCard({ total, count }) {
  return (
    <div className="stat-card stat-card--income">
      {/* Icon badge */}
      <div className="stat-card__header">
        <p className="stat-card__label">Total Income</p>
        <span className="stat-card__icon">↑</span>
      </div>

      {/* Main number */}
      <p className="stat-card__value income-color">
        {formatCurrency(total)}
      </p>

      {/* Supporting detail */}
      <p className="stat-card__sub">{count} source{count !== 1 ? "s" : ""}</p>
    </div>
  );
}


/**
 * ============================================================
 * FILE: src/components/dashboard/ExpenseCard.jsx
 * ============================================================
 *
 * PURPOSE:
 *   Mirror of IncomeCard but for the expense total.
 *   Both cards live in the same file to keep tiny related
 *   components together (common in React codebases).
 *
 * PROPS:
 *   total {number}  – sum of all expense transactions
 *   count {number}  – number of expense transactions
 * ============================================================
 */
export function ExpenseCard({ total, count }) {
  return (
    <div className="stat-card stat-card--expense">
      <div className="stat-card__header">
        <p className="stat-card__label">Total Expenses</p>
        <span className="stat-card__icon">↓</span>
      </div>
      <p className="stat-card__value expense-color">
        {formatCurrency(total)}
      </p>
      <p className="stat-card__sub">{count} entr{count !== 1 ? "ies" : "y"}</p>
    </div>
  );
}
