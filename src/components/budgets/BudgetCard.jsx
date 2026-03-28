/**
 * ============================================================
 * FILE: src/components/budgets/BudgetCard.jsx
 * ============================================================
 *
 * PURPOSE:
 *   Displays one budget entry as a card with:
 *   • Category name and current spending
 *   • A colour-coded progress bar (green → amber → red)
 *   • Remaining / over-budget amount
 *   • An inline "edit limit" control
 *
 * PROPS (all pre-computed by BudgetSection):
 *   category   {string}   – e.g. "Food"
 *   limit      {number}   – monthly budget ceiling
 *   spent      {number}   – actual spending so far
 *   remaining  {number}   – limit − spent (may be negative)
 *   pct        {number}   – 0–100 (capped) for the progress bar
 *   overBudget {boolean}  – true when spent > limit
 *
 * LOCAL STATE:
 *   This component owns one small piece of transient UI state:
 *   whether the "edit limit" input is open.  That toggle is
 *   purely cosmetic and does not belong in global state.
 *
 * DISPATCHES:
 *   SET_BUDGET – when the user confirms a new limit value.
 * ============================================================
 */

import React, { useState } from "react";
import { useFinance }      from "../../context/FinanceContext";
import { SET_BUDGET }      from "../../context/actions";
import { formatCurrency }  from "../../utils/calculations";

function BudgetCard({ category, limit, spent, remaining, pct, overBudget }) {
  const { dispatch } = useFinance();

  /* ── Local UI state ────────────────────────────────────────── */
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(limit));

  /* ── Progress bar colour logic ─────────────────────────────── */
  const barColor = overBudget
    ? "var(--color-red)"
    : pct > 80
    ? "var(--color-amber)"
    : "var(--color-green)";

  /* ── Save updated limit ────────────────────────────────────── */
  function handleSave() {
    const newLimit = parseFloat(inputValue);
    if (!isNaN(newLimit) && newLimit > 0) {
      dispatch({ type: SET_BUDGET, payload: { category, limit: newLimit } });
    }
    setIsEditing(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") setIsEditing(false);
  }

  return (
    <div className={`budget-card ${overBudget ? "budget-card--over" : ""}`}>
      {/* ── Top row: name on the left, edit on the right ──────── */}
      <div className="budget-card__top">
        <div>
          <p className="budget-card__category">{category}</p>
          <p className="budget-card__spent">{formatCurrency(spent)} spent</p>
        </div>

        <div className="budget-card__right">
          {isEditing ? (
            /* Inline edit controls */
            <div className="budget-card__edit-row">
              <span className="budget-card__dollar">$</span>
              <input
                type="number"
                min="1"
                className="budget-card__input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              <button className="btn-confirm" onClick={handleSave} aria-label="Save">✓</button>
              <button className="btn-cancel"  onClick={() => setIsEditing(false)} aria-label="Cancel">✕</button>
            </div>
          ) : (
            <button
              className="btn-ghost btn-sm"
              onClick={() => { setInputValue(String(limit)); setIsEditing(true); }}
            >
              Edit
            </button>
          )}

          {/* Remaining / over-budget indicator */}
          <p className={`budget-card__remaining ${overBudget ? "expense-color" : "income-color"}`}>
            {overBudget
              ? `Over ${formatCurrency(Math.abs(remaining))}`
              : `${formatCurrency(remaining)} left`}
          </p>
        </div>
      </div>

      {/* ── Progress bar ─────────────────────────────────────── */}
      <div className="progress-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div
          className="progress-bar__fill"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>

      {/* ── Footer labels ─────────────────────────────────────── */}
      <div className="budget-card__footer">
        <span>{pct}% used</span>
        <span>Budget: {formatCurrency(limit)}</span>
      </div>
    </div>
  );
}

export default BudgetCard;
