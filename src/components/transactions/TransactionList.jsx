/**
 * ============================================================
 * FILE: src/components/transactions/TransactionList.jsx
 * ============================================================
 *
 * PURPOSE:
 *   Reads the full transactions array and active filters from
 *   Context, applies client-side filtering/sorting, then maps
 *   the result to <TransactionItem> components.
 *
 * RESPONSIBILITIES:
 *   • Render filter/sort controls → dispatch SET_FILTER on change.
 *   • Derive the filtered + sorted list using useMemo so the
 *     computation only re-runs when transactions or filters change.
 *   • Render the list or an empty-state message.
 *   • Relay the `onEdit` callback down to each TransactionItem.
 *
 * PROPS:
 *   onEdit {function}  – passed through to TransactionItem so that
 *                        clicking "Edit" on a row surfaces to the
 *                        parent (HomePage) which owns the form.
 *
 * PERFORMANCE NOTE — useMemo:
 *   The filtering + sorting runs in O(n log n) time.  For the
 *   typical budget app dataset (<1 000 records) this is instant.
 *   We memoize anyway as a good habit; if transactions grew to
 *   tens-of-thousands, the memo would prevent costly re-renders.
 * ============================================================
 */

import React, { useMemo } from "react";
import { useFinance }      from "../../context/FinanceContext";
import { SET_FILTER }      from "../../context/actions";
import TransactionItem     from "./TransactionItem";

function TransactionList({ onEdit }) {
  const { state, dispatch } = useFinance();
  const { transactions, filters } = state;

  /* ── Build the unique category list for the filter dropdown ─
   *
   * useMemo dependency: [transactions] — recalculate only when the
   * transaction array changes (add/delete/edit).
   * ─────────────────────────────────────────────────────────── */
  const allCategories = useMemo(
    () => [...new Set(transactions.map((tx) => tx.category))].sort(),
    [transactions]
  );

  /* ── Apply active filters & sort order ───────────────────────
   *
   * Steps:
   *   1. Shallow-copy the array (sort mutates in-place, so we must
   *      never sort state.transactions directly — that would mutate
   *      the Redux-like immutable state tree).
   *   2. Filter by type ("all" skips this step).
   *   3. Filter by category ("all" skips this step).
   *   4. Sort by the selected criterion.
   *
   * Dependencies: [transactions, filters] — recalculate whenever
   * the transaction data changes OR the user changes a filter.
   * ─────────────────────────────────────────────────────────── */
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // Filter by type
    if (filters.type !== "all") {
      result = result.filter((tx) => tx.type === filters.type);
    }

    // Filter by category
    if (filters.category !== "all") {
      result = result.filter((tx) => tx.category === filters.category);
    }

    // Sort
    if (filters.sortBy === "date") {
      // Newest first
      result.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (filters.sortBy === "amount") {
      // Largest first
      result.sort((a, b) => b.amount - a.amount);
    }

    return result;
  }, [transactions, filters]);

  /* ── Filter change dispatcher ─────────────────────────────────
   *
   * A single generic handler reads the select element's name and
   * value, then dispatches a partial SET_FILTER payload.
   * The reducer merges it with the existing filters object.
   * ─────────────────────────────────────────────────────────── */
  function handleFilterChange(e) {
    dispatch({
      type:    SET_FILTER,
      payload: { [e.target.name]: e.target.value },
    });
  }

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div className="card transaction-list">
      {/* ── Toolbar: filter + sort controls ──────────────────── */}
      <div className="card__header card__header--col">
        <p className="section-heading">All Transactions</p>
        <div className="tx-list__filters">
          {/* Type filter */}
          <select
            name="type"
            className="filter-select"
            value={filters.type}
            onChange={handleFilterChange}
            aria-label="Filter by type"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          {/* Category filter */}
          <select
            name="category"
            className="filter-select"
            value={filters.category}
            onChange={handleFilterChange}
            aria-label="Filter by category"
          >
            <option value="all">All Categories</option>
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Sort order */}
          <select
            name="sortBy"
            className="filter-select"
            value={filters.sortBy}
            onChange={handleFilterChange}
            aria-label="Sort transactions"
          >
            <option value="date">Sort: Date</option>
            <option value="amount">Sort: Amount</option>
          </select>

          {/* Result count badge */}
          <span className="tx-list__count">
            {filteredTransactions.length} record
            {filteredTransactions.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* ── List ──────────────────────────────────────────────── */}
      <div className="tx-list__scroll">
        {filteredTransactions.length === 0 ? (
          <p className="empty-message">No transactions match your filters.</p>
        ) : (
          filteredTransactions.map((tx) => (
            <TransactionItem
              key={tx.id}
              transaction={tx}
              onEdit={onEdit}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default TransactionList;
