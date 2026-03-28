/**
 * ============================================================
 * FILE: src/components/budgets/BudgetSection.jsx
 * ============================================================
 *
 * PURPOSE:
 *   The Budgets tab content.  Orchestrates the budget overview:
 *   • Summary stat cards (total budgeted, total spent, remaining).
 *   • A grid of BudgetCard components — one per budget entry.
 *   • A form to add a budget for a new category.
 *
 * RESPONSIBILITIES:
 *   • Read state.budgets and state.transactions via useFinance().
 *   • Use getBudgetStatus() to enrich budget data with spending figures.
 *   • Determine which expense categories have NO budget yet (so the
 *     "Add Budget" form only shows un-budgeted categories).
 *   • Dispatch SET_BUDGET when the user adds a new category budget.
 *
 * LOCAL STATE:
 *   Only the "add new budget" form fields (newCategory, newLimit)
 *   live here.  They are transient UI state, not global data.
 * ============================================================
 */

import React, { useState, useMemo } from "react";
import { useFinance }               from "../../context/FinanceContext";
import { SET_BUDGET }               from "../../context/actions";
import BudgetCard                   from "./BudgetCard";
import {
  getBudgetStatus,
  getTotalExpense,
  formatCurrency,
} from "../../utils/calculations";

/* All expense categories the app recognises */
const ALL_EXPENSE_CATS = [
  "Food","Rent","Transport","Entertainment",
  "Shopping","Health","Education","Utilities","Other",
];

function BudgetSection() {
  const { state, dispatch } = useFinance();
  const { transactions, budgets } = state;

  /* ── Enrich budgets with actual spending data ──────────────── */
  const budgetStatuses = useMemo(
    () => getBudgetStatus(transactions, budgets),
    [transactions, budgets]
  );

  /* ── Summary aggregates ────────────────────────────────────── */
  const totalBudgeted = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent    = getTotalExpense(transactions);
  const totalLeft     = Math.max(totalBudgeted - totalSpent, 0);

  /* ── Categories with no budget yet ────────────────────────── */
  const budgetedCats = budgets.map((b) => b.category);
  const unbadgetedCats = ALL_EXPENSE_CATS.filter(
    (c) => !budgetedCats.includes(c)
  );

  /* ── "Add budget" form local state ────────────────────────── */
  const [newCategory, setNewCategory] = useState(unbadgetedCats[0] || "");
  const [newLimit,    setNewLimit]    = useState("");
  const [formError,   setFormError]   = useState("");

  /* Keep newCategory in sync if the available categories change */
  useMemo(() => {
    if (unbadgetedCats.length > 0 && !unbadgetedCats.includes(newCategory)) {
      setNewCategory(unbadgetedCats[0]);
    }
  }, [unbadgetedCats.length]); // eslint-disable-line

  /* ── Add budget handler ────────────────────────────────────── */
  function handleAddBudget() {
    const limit = parseFloat(newLimit);
    if (!newLimit || isNaN(limit) || limit <= 0) {
      setFormError("Please enter a valid positive limit.");
      return;
    }
    dispatch({ type: SET_BUDGET, payload: { category: newCategory, limit } });
    setNewLimit("");
    setFormError("");
  }

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div className="budget-section">
      {/* ── Summary stats ──────────────────────────────────────── */}
      <div className="budget-section__stats">
        <div className="stat-card stat-card--savings">
          <div className="stat-card__header">
            <p className="stat-card__label">Total Budget</p>
            <span className="stat-card__icon">◈</span>
          </div>
          <p className="stat-card__value savings-color">{formatCurrency(totalBudgeted)}</p>
        </div>
        <div className="stat-card stat-card--expense">
          <div className="stat-card__header">
            <p className="stat-card__label">Total Spent</p>
            <span className="stat-card__icon">↓</span>
          </div>
          <p className="stat-card__value expense-color">{formatCurrency(totalSpent)}</p>
        </div>
        <div className="stat-card stat-card--income">
          <div className="stat-card__header">
            <p className="stat-card__label">Remaining</p>
            <span className="stat-card__icon">✓</span>
          </div>
          <p className="stat-card__value income-color">{formatCurrency(totalLeft)}</p>
        </div>
      </div>

      {/* ── Budget cards grid ──────────────────────────────────── */}
      <div className="budget-grid">
        {budgetStatuses.map((status) => (
          <BudgetCard key={status.category} {...status} />
        ))}
      </div>

      {/* ── Add new budget form ────────────────────────────────── */}
      {unbadgetedCats.length > 0 && (
        <div className="card add-budget-form">
          <div className="card__header">
            <p className="section-heading">Add Budget Category</p>
          </div>
          <div className="card__body add-budget-form__row">
            <div className="form-group">
              <label className="form-label" htmlFor="newCategory">Category</label>
              <select
                id="newCategory"
                className="form-input"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              >
                {unbadgetedCats.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="newLimit">Monthly Limit ($)</label>
              <input
                id="newLimit"
                type="number"
                min="1"
                className="form-input form-input--mono"
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
                placeholder="500"
                onKeyDown={(e) => e.key === "Enter" && handleAddBudget()}
              />
            </div>
            <div className="form-group form-group--action">
              <button className="btn-primary" onClick={handleAddBudget}>
                + Add Budget
              </button>
            </div>
          </div>
          {formError && <p className="form-error" style={{padding:"0 1.25rem 1rem"}}>{formError}</p>}
        </div>
      )}
    </div>
  );
}

export default BudgetSection;
