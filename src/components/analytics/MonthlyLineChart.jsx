/**
 * ============================================================
 * FILE: src/components/analytics/MonthlyLineChart.jsx
 * ============================================================
 *
 * PURPOSE:
 *   Renders a dual-line chart comparing monthly income vs
 *   monthly expenses over time.
 *
 * LIBRARY: Recharts (LineChart + Line + XAxis + YAxis + etc.)
 *
 * PROPS:
 *   data {Array<{ month, label, income, expense }>}
 *     – Output of getMonthlyData() from calculations.js.
 *       Already sorted chronologically so the X-axis reads
 *       left-to-right oldest → newest.
 *
 * TICK FORMATTER:
 *   The Y-axis formats large values as "$5k" to save space.
 *   The exact threshold (1 000) and suffix ("k") are hard-coded
 *   here; adjust if you need a different scale (millions → "M").
 * ============================================================
 */

import React from "react";
import {
  LineChart, Line,
  XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "../../utils/calculations";

/* Design tokens — kept in sync with global CSS variables */
const COLOR_INCOME  = "#34d399";
const COLOR_EXPENSE = "#fb7185";
const COLOR_GRID    = "rgba(255,255,255,0.05)";
const COLOR_TICK    = "#475569";

/* Custom tooltip component */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__label">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="chart-tooltip__value" style={{ color: p.color }}>
          {p.name.charAt(0).toUpperCase() + p.name.slice(1)}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
}

/* Y-axis tick formatter */
function formatYAxis(value) {
  if (value >= 1000) return `$${Math.round(value / 1000)}k`;
  return `$${value}`;
}

function MonthlyLineChart({ data }) {
  if (data.length === 0) {
    return <p className="empty-message">No monthly data to display yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
        {/* Subtle horizontal grid lines only (no vertical) */}
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={COLOR_GRID}
          vertical={false}
        />

        {/* X-axis: human-readable month labels */}
        <XAxis
          dataKey="label"
          tick={{ fill: COLOR_TICK, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />

        {/* Y-axis: abbreviated dollar values */}
        <YAxis
          tick={{ fill: COLOR_TICK, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={formatYAxis}
        />

        <Tooltip content={<CustomTooltip />} />

        <Legend
          formatter={(value) => (
            <span style={{ color: COLOR_TICK, fontSize: 11, textTransform: "capitalize" }}>
              {value}
            </span>
          )}
        />

        {/* Income line */}
        <Line
          type="monotone"
          dataKey="income"
          stroke={COLOR_INCOME}
          strokeWidth={2.5}
          dot={{ fill: COLOR_INCOME, r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6 }}
        />

        {/* Expense line */}
        <Line
          type="monotone"
          dataKey="expense"
          stroke={COLOR_EXPENSE}
          strokeWidth={2.5}
          dot={{ fill: COLOR_EXPENSE, r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default MonthlyLineChart;
