/**
 * ============================================================
 * FILE: src/components/analytics/Charts.jsx
 * ============================================================
 *
 * PURPOSE:
 *   The Analytics tab's top-level component.  It:
 *   1. Pulls raw data from Context (single source of truth).
 *   2. Runs utility functions to produce chart-ready datasets.
 *   3. Passes those datasets as props to the specialised chart
 *      components (no data-fetching happens in leaf charts).
 *   4. Lays out the charts in a readable grid.
 *
 * DESIGN PRINCIPLE — "smart parent / dumb children":
 *   Charts.jsx is the only analytics component that knows about
 *   Context.  ExpensePieChart and MonthlyLineChart are pure
 *   presentational components — they receive arrays and render them.
 *   This makes the chart components trivially reusable and testable.
 *
 * DATA TRANSFORMS USED:
 *   getCategoryExpensesArray() → sorted [{ name, value }] for PieChart & BarChart
 *   getMonthlyData()           → chronological [{ label, income, expense }] for LineChart
 * ============================================================
 */

import React, { useMemo } from "react";
import {
  BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

import { useFinance }             from "../../context/FinanceContext";
import ExpensePieChart            from "./ExpensePieChart";
import MonthlyLineChart           from "./MonthlyLineChart";
import {
  getTotalIncome,
  getTotalExpense,
  getCategoryExpensesArray,
  getMonthlyData,
  formatCurrency,
} from "../../utils/calculations";

/* Colour palette (same as ExpensePieChart for visual consistency) */
const COLORS = [
  "#f0b429","#34d399","#fb7185","#60a5fa",
  "#a78bfa","#f472b6","#38bdf8","#818cf8","#fb923c",
];

/* Shared tooltip style for BarChart */
function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__label">{label}</p>
      <p className="chart-tooltip__value">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

function Charts() {
  const { state } = useFinance();
  const { transactions } = state;

  /* ── Derived datasets (memoised) ──────────────────────────── */

  const income  = getTotalIncome(transactions);
  const expense = getTotalExpense(transactions);

  /**
   * categoryData: [{ name: "Food", value: 700 }, ...]
   * Used by: ExpensePieChart (donut) + BarChart (category breakdown)
   */
  const categoryData = useMemo(
    () => getCategoryExpensesArray(transactions),
    [transactions]
  );

  /**
   * monthlyData: [{ month, label, income, expense }, ...]
   * Used by: MonthlyLineChart
   */
  const monthlyData = useMemo(
    () => getMonthlyData(transactions),
    [transactions]
  );

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div className="charts-section">
      {/* ── Summary row ────────────────────────────────────────── */}
      <div className="charts-section__summary">
        <div className="stat-card stat-card--income">
          <div className="stat-card__header">
            <p className="stat-card__label">Total Income</p>
            <span className="stat-card__icon">↑</span>
          </div>
          <p className="stat-card__value income-color">{formatCurrency(income)}</p>
        </div>
        <div className="stat-card stat-card--expense">
          <div className="stat-card__header">
            <p className="stat-card__label">Total Expenses</p>
            <span className="stat-card__icon">↓</span>
          </div>
          <p className="stat-card__value expense-color">{formatCurrency(expense)}</p>
        </div>
        <div className="stat-card stat-card--savings">
          <div className="stat-card__header">
            <p className="stat-card__label">Net Savings</p>
            <span className="stat-card__icon">◈</span>
          </div>
          <p className={`stat-card__value ${income - expense >= 0 ? "income-color" : "expense-color"}`}>
            {formatCurrency(Math.abs(income - expense))}
          </p>
        </div>
      </div>

      {/* ── Line chart + Pie chart side by side ────────────────── */}
      <div className="charts-section__row">
        {/* Monthly trend */}
        <div className="card">
          <div className="card__header">
            <p className="section-heading">Monthly Income vs Expenses</p>
          </div>
          <div className="card__body">
            {/*
             * MonthlyLineChart is purely presentational:
             * it receives the pre-computed array and renders it.
             * Charts.jsx owns the data logic.
             */}
            <MonthlyLineChart data={monthlyData} />
          </div>
        </div>

        {/* Pie chart */}
        <div className="card">
          <div className="card__header">
            <p className="section-heading">Spending by Category</p>
          </div>
          <div className="card__body">
            {/*
             * ExpensePieChart is also purely presentational.
             * The data is already aggregated — it just draws.
             */}
            <ExpensePieChart data={categoryData} />
          </div>
        </div>
      </div>

      {/* ── Bar chart — full width ─────────────────────────────── */}
      <div className="card">
        <div className="card__header">
          <p className="section-heading">Expense Breakdown by Category</p>
        </div>
        <div className="card__body">
          {categoryData.length === 0 ? (
            <p className="empty-message">No expense data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={categoryData}
                margin={{ top: 5, right: 5, left: -10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#475569", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#475569", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => v >= 1000 ? `$${Math.round(v/1000)}k` : `$${v}`}
                />
                <Tooltip content={<BarTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

export default Charts;
