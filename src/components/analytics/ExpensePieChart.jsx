/**
 * ============================================================
 * FILE: src/components/analytics/ExpensePieChart.jsx
 * ============================================================
 *
 * PURPOSE:
 *   Renders a donut pie chart of expenses broken down by category,
 *   plus a small legend below.
 *
 * LIBRARY: Recharts (PieChart + Pie + Cell + Tooltip + ResponsiveContainer)
 *
 * PROPS:
 *   data {Array<{ name: string, value: number }>}
 *     – Pre-processed category expense array from Charts.jsx.
 *       Sorted descending by value so the largest slice comes first.
 *
 * WHY A SEPARATE FILE?
 *   Charts.jsx is responsible for fetching data from Context and
 *   laying out multiple charts.  Each chart component focuses purely
 *   on how to render a single visualisation — separation of concerns.
 * ============================================================
 */

import React from "react";
import {
  PieChart, Pie, Cell,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "../../utils/calculations";

/* 9-colour palette — cycling for more categories */
const COLORS = [
  "#f0b429","#34d399","#fb7185","#60a5fa",
  "#a78bfa","#f472b6","#38bdf8","#818cf8","#fb923c",
];

/* Custom tooltip so we control the styling */
function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__label">{name}</p>
      <p className="chart-tooltip__value">{formatCurrency(value)}</p>
    </div>
  );
}

function ExpensePieChart({ data }) {
  if (data.length === 0) {
    return <p className="empty-message">No expense data to display.</p>;
  }

  return (
    <>
      {/* Donut chart */}
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}   /* innerRadius > 0 creates the "donut" hole */
            outerRadius={80}
            paddingAngle={2}   /* small gap between slices for readability */
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend — top 5 categories */}
      <div className="pie-legend">
        {data.slice(0, 5).map((entry, i) => (
          <div key={entry.name} className="pie-legend__row">
            <span
              className="pie-legend__dot"
              style={{ background: COLORS[i % COLORS.length] }}
            />
            <span className="pie-legend__name">{entry.name}</span>
            <span className="pie-legend__val">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    </>
  );
}

export default ExpensePieChart;
