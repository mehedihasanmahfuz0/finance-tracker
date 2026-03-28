/**
 * ============================================================
 * FILE: src/components/dashboard/Dashboard.jsx
 * ============================================================
 *
 * PURPOSE:
 *   The "Overview" screen.  Pulls raw data from the global Context,
 *   derives computed values using utility functions, and composes
 *   several smaller display components into one cohesive view.
 *
 * RESPONSIBILITIES:
 *   • Read state.transactions via useFinance().
 *   • Derive: total income, total expense, balance, savings rate,
 *     top spending categories with budget progress.
 *   • Render:  BalanceCard, IncomeCard, ExpenseCard, recent
 *     activity feed, top-category mini-list.
 *   • Does NOT dispatch any actions — it is a pure read view.
 *
 * DATA FLOW IN THIS COMPONENT:
 *   Context (state) → calculations.js helpers → props → child components
 *
 * PROPS:
 *   onGoTransactions {function}  – called when the user clicks
 *                                  "View All" so HomePage can switch tabs.
 * ============================================================
 */

import React from "react";
import { useFinance }                    from "../../context/FinanceContext";
import BalanceCard                       from "./BalanceCard";
import { IncomeCard, ExpenseCard }       from "./IncomeCard";
import {
  getTotalIncome,
  getTotalExpense,
  getSavingsRate,
  getCategoryExpenses,
  formatCurrency,
  formatDate,
} from "../../utils/calculations";

function Dashboard({ onGoTransactions }) {
  /* ── 1. Pull raw state from Context ───────────────────────── */
  const { state } = useFinance();
  const { transactions, budgets } = state;

  /* ── 2. Derive aggregate totals ───────────────────────────── */
  const income    = getTotalIncome(transactions);
  const expense   = getTotalExpense(transactions);
  const savRate   = getSavingsRate(transactions);

  /* ── 3. Derive counts for the stat cards ──────────────────── */
  const incomeCount  = transactions.filter((tx) => tx.type === "income").length;
  const expenseCount = transactions.filter((tx) => tx.type === "expense").length;

  /* ── 4. Recent transactions (newest 5) ────────────────────── */
  const recent = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  /* ── 5. Top spending categories with budget data ──────────── */
  const catExpenses = getCategoryExpenses(transactions);
  const topCats = Object.entries(catExpenses)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([cat, spent]) => {
      const budget = budgets.find((b) => b.category === cat);
      return {
        cat,
        spent,
        limit:   budget?.limit ?? null,
        pct:     budget ? Math.min((spent / budget.limit) * 100, 100) : null,
        overBudget: budget ? spent > budget.limit : false,
      };
    });

  /* ── 6. Render ─────────────────────────────────────────────── */
  return (
    <div className="dashboard">
      {/* Hero balance card */}
      <BalanceCard income={income} expense={expense} />

      {/* ── Stat cards row ─────────────────────────────────────── */}
      <div className="dashboard__stats-row">
        <IncomeCard  total={income}  count={incomeCount}  />
        <ExpenseCard total={expense} count={expenseCount} />
        {/* Savings rate card — defined inline; small enough to not need its own file */}
        <div className="stat-card stat-card--savings">
          <div className="stat-card__header">
            <p className="stat-card__label">Savings Rate</p>
            <span className="stat-card__icon">◈</span>
          </div>
          <p className="stat-card__value savings-color">{savRate}%</p>
          <p className="stat-card__sub">{transactions.length} total records</p>
        </div>
      </div>

      {/* ── Lower two-column grid ──────────────────────────────── */}
      <div className="dashboard__lower-grid">

        {/* Recent Activity Feed */}
        <div className="card">
          <div className="card__header">
            <p className="section-heading">Recent Activity</p>
            <button className="btn-ghost" onClick={onGoTransactions}>
              View all →
            </button>
          </div>

          {recent.map((tx) => (
            <div key={tx.id} className="activity-row">
              {/* Direction icon */}
              <div className={`activity-row__icon ${tx.type === "income" ? "income-bg" : "expense-bg"}`}>
                {tx.type === "income" ? "↑" : "↓"}
              </div>

              {/* Description + meta */}
              <div className="activity-row__info">
                <p className="activity-row__title">
                  {tx.description || tx.category}
                </p>
                <p className="activity-row__meta">
                  <span className={`tag ${tx.type === "income" ? "tag--income" : "tag--expense"}`}>
                    {tx.category}
                  </span>
                  {formatDate(tx.date)}
                </p>
              </div>

              {/* Amount */}
              <p className={`activity-row__amount ${tx.type === "income" ? "income-color" : "expense-color"}`}>
                {tx.type === "income" ? "+" : "−"}
                {formatCurrency(tx.amount)}
              </p>
            </div>
          ))}
        </div>

        {/* Top Spending panel */}
        <div className="card">
          <div className="card__header">
            <p className="section-heading">Top Spending</p>
          </div>

          <div className="card__body">
            {topCats.length === 0 ? (
              <p className="empty-message">No expenses recorded yet.</p>
            ) : (
              topCats.map(({ cat, spent, limit, pct, overBudget }) => (
                <div key={cat} className="top-cat-row">
                  {/* Name + amount */}
                  <div className="top-cat-row__header">
                    <span className="top-cat-row__name">{cat}</span>
                    <span className="top-cat-row__amount">
                      {formatCurrency(spent)}
                    </span>
                  </div>

                  {/* Progress bar (only shown if a budget exists) */}
                  {pct !== null && (
                    <>
                      <div className="progress-bar">
                        <div
                          className="progress-bar__fill"
                          style={{
                            width: `${pct}%`,
                            background: overBudget
                              ? "var(--color-red)"
                              : pct > 80
                              ? "var(--color-amber)"
                              : "var(--color-green)",
                          }}
                        />
                      </div>
                      <p className="top-cat-row__meta">
                        {Math.round(pct)}% of {formatCurrency(limit)} budget
                      </p>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>{/* /.dashboard__lower-grid */}
    </div>/* /.dashboard */
  );
}

export default Dashboard;
