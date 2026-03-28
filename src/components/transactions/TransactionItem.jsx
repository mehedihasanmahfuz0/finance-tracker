/**
 * ============================================================
 * FILE: src/components/transactions/TransactionItem.jsx
 * ============================================================
 *
 * PURPOSE:
 *   Renders a single row in the transaction list.
 *   Handles the Delete action directly (dispatches DELETE_TRANSACTION).
 *   Delegates Edit to the parent via the `onEdit` callback so the
 *   parent (TransactionList → HomePage) can open TransactionForm
 *   in "edit" mode.
 *
 * PROPS:
 *   transaction {Object}    – a single transaction from state.
 *   onEdit      {function}  – called with the transaction object so
 *                             the parent can set its `editing` state.
 *
 * PATTERN — lifting state:
 *   TransactionItem doesn't know about the editing form.  It simply
 *   tells the parent "the user wants to edit this".  The parent
 *   decides what happens next (open a modal, scroll to form, etc.).
 *   This keeps TransactionItem focused on *display and delete*.
 * ============================================================
 */

import React, { useState }         from "react";
import { useFinance }               from "../../context/FinanceContext";
import { DELETE_TRANSACTION }       from "../../context/actions";
import { formatCurrency, formatDate } from "../../utils/calculations";

function TransactionItem({ transaction, onEdit }) {
  const { dispatch } = useFinance();

  /* Local hover state for revealing action buttons.
   * Only this component needs to know about hover — no need for Context. */
  const [hovered, setHovered] = useState(false);

  const isIncome = transaction.type === "income";

  /* ── Delete handler ──────────────────────────────────────────
   *
   * Dispatch pattern:
   *   type    → identifies which reducer case to execute
   *   payload → the id is all the reducer needs to filter the array
   * ─────────────────────────────────────────────────────────── */
  function handleDelete() {
    dispatch({ type: DELETE_TRANSACTION, payload: transaction.id });
  }

  return (
    <div
      className={`tx-row ${hovered ? "tx-row--hovered" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Direction icon */}
      <div className={`tx-row__icon ${isIncome ? "income-bg" : "expense-bg"}`}>
        {isIncome ? "↑" : "↓"}
      </div>

      {/* Main info */}
      <div className="tx-row__info">
        <p className="tx-row__title">
          {transaction.description || transaction.category}
        </p>
        <p className="tx-row__meta">
          <span className={`tag ${isIncome ? "tag--income" : "tag--expense"}`}>
            {transaction.category}
          </span>
          {formatDate(transaction.date)}
        </p>
      </div>

      {/* Amount */}
      <p className={`tx-row__amount ${isIncome ? "income-color" : "expense-color"}`}>
        {isIncome ? "+" : "−"}
        {formatCurrency(transaction.amount)}
      </p>

      {/* Action buttons — visible on hover */}
      <div className={`tx-row__actions ${hovered ? "tx-row__actions--visible" : ""}`}>
        <button
          className="btn-ghost btn-sm"
          onClick={() => onEdit(transaction)}
          aria-label="Edit transaction"
        >
          Edit
        </button>
        <button
          className="btn-danger btn-sm"
          onClick={handleDelete}
          aria-label="Delete transaction"
        >
          Del
        </button>
      </div>
    </div>
  );
}

export default TransactionItem;
