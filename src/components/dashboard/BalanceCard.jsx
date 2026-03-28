/**
 * ============================================================
 * FILE: src/components/dashboard/BalanceCard.jsx
 * ============================================================
 *
 * PURPOSE:
 *   The hero card at the top of the Dashboard.  Displays the
 *   current net balance (income − expense) with prominent
 *   typography, plus quick-read income/expense sub-values.
 *
 * PROPS:
 *   income  {number}  – total income from all transactions
 *   expense {number}  – total expenses from all transactions
 *
 * WHY A SEPARATE COMPONENT?
 *   The balance is the single most important figure in the app.
 *   Isolating it lets us give it distinct styling and makes it
 *   reusable if we ever want to show it in a sidebar or header.
 * ============================================================
 */

import React from "react";
import { formatCurrency } from "../../utils/calculations";

/**
 * BalanceCard
 * Receives pre-computed income & expense totals from Dashboard
 * (which reads them from Context).  This component is "dumb" —
 * it only renders; all computation happens upstream.
 */
function BalanceCard({ income, expense }) {
  const balance   = income - expense;
  const isPositive = balance >= 0;

  return (
    <div className="balance-card">
      {/* ── Decorative background circles for depth ──────────── */}
      <div className="balance-card__circle balance-card__circle--top"    />
      <div className="balance-card__circle balance-card__circle--bottom" />

      {/* ── Label ──────────────────────────────────────────────── */}
      <p className="balance-card__label">Current Balance</p>

      {/* ── Main figure ────────────────────────────────────────── */}
      <p className={`balance-card__amount ${isPositive ? "positive" : "negative"}`}>
        {formatCurrency(Math.abs(balance))}
        <span className="balance-card__tag">
          {isPositive ? "surplus" : "deficit"}
        </span>
      </p>

      {/* ── Income / Expense sub-row ────────────────────────────── */}
      <div className="balance-card__sub-row">
        {/* Income block */}
        <div className="balance-card__sub-item">
          <div className="balance-card__icon balance-card__icon--income">↑</div>
          <div>
            <p className="balance-card__sub-label">Income</p>
            <p className="balance-card__sub-amount income-color">
              {formatCurrency(income)}
            </p>
          </div>
        </div>

        {/* Expense block */}
        <div className="balance-card__sub-item">
          <div className="balance-card__icon balance-card__icon--expense">↓</div>
          <div>
            <p className="balance-card__sub-label">Expenses</p>
            <p className="balance-card__sub-amount expense-color">
              {formatCurrency(expense)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BalanceCard;
