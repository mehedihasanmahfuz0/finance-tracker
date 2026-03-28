/**
 * ============================================================
 * FILE: src/components/transactions/TransactionForm.jsx
 * ============================================================
 *
 * PURPOSE:
 *   A controlled form that handles BOTH creating a new transaction
 *   AND editing an existing one.  The `editing` prop determines
 *   which mode is active.
 *
 * STATE:
 *   All form fields are stored in a single `formData` state object
 *   (controlled component pattern).  This makes it straightforward
 *   to reset, validate, and dispatch in one place.
 *
 * DISPATCHES:
 *   ADD_TRANSACTION  – when editing prop is null/undefined.
 *   EDIT_TRANSACTION – when editing prop contains a transaction object.
 *
 * PROPS:
 *   editing  {Object|null}  – the transaction to edit, or null for "add" mode.
 *   onDone   {function}     – called after a successful submit or "Cancel".
 *                             The parent uses this to clear the `editing` state.
 *
 * CONTROLLED FORM PATTERN:
 *   Every input's value is driven by React state.
 *   onChange handlers call setFormData (never mutate state directly).
 *   On submit, we read formData, validate, then dispatch.
 * ============================================================
 */

import React, { useState, useEffect } from "react";
import { useFinance }                 from "../../context/FinanceContext";
import { ADD_TRANSACTION, EDIT_TRANSACTION } from "../../context/actions";
import { generateId } from "../../utils/calculations";

/* ── Category options per transaction type ─────────────────── */
const EXPENSE_CATEGORIES = [
  "Food", "Rent", "Transport", "Entertainment",
  "Shopping", "Health", "Education", "Utilities", "Other",
];
const INCOME_CATEGORIES = [
  "Salary", "Freelance", "Investment", "Gift", "Other",
];

/* ── Blank form template (used for reset + initial state) ─── */
const BLANK_FORM = {
  type:        "expense",
  amount:      "",
  category:    "Food",
  date:        new Date().toISOString().slice(0, 10), // "YYYY-MM-DD"
  description: "",
};

function TransactionForm({ editing, onDone }) {
  const { dispatch } = useFinance();

  /* ── Local form state ──────────────────────────────────────── */
  const [formData, setFormData] = useState(BLANK_FORM);
  const [error, setError]       = useState("");

  /* ── Sync form with `editing` prop ────────────────────────────
   *
   * useEffect with [editing] as dependency:
   *   • When editing becomes a transaction object → pre-fill the form.
   *   • When editing becomes null (user cancelled or saved) → reset.
   *
   * Important: we spread `editing` so the form state is a COPY,
   * not a reference to the state object.  Mutating a reference
   * would bypass the reducer.
   * ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (editing) {
      setFormData({ ...editing, amount: String(editing.amount) });
    } else {
      setFormData(BLANK_FORM);
    }
    setError(""); // Clear any previous validation messages
  }, [editing]);

  /* ── Generic field change handler ─────────────────────────────
   *
   * Using a single handler for all fields reduces boilerplate.
   * We receive the field name from `name` attribute on each input.
   *
   * Special case: when the `type` field changes we also reset the
   * category so an "expense" category is never attached to an
   * "income" transaction and vice-versa.
   * ─────────────────────────────────────────────────────────── */
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      // Reset category when switching type
      if (name === "type") {
        next.category = value === "expense" ? "Food" : "Salary";
      }
      return next;
    });
  }

  /* ── Submit handler ────────────────────────────────────────── */
  function handleSubmit() {
    /* Validation */
    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      setError("Please enter a valid positive amount.");
      return;
    }
    if (!formData.date) {
      setError("Please select a date.");
      return;
    }

    /* Build the transaction payload */
    const payload = {
      ...formData,
      amount,                                    // Convert string → number
      id: editing ? editing.id : generateId(),   // Preserve id on edit
    };

    /* Dispatch the appropriate action */
    if (editing) {
      dispatch({ type: EDIT_TRANSACTION, payload });
    } else {
      dispatch({ type: ADD_TRANSACTION, payload });
      setFormData(BLANK_FORM); // Reset form after successful add
    }

    setError("");
    onDone(); // Notify parent (e.g. clear editing state)
  }

  /* ── Derived values for rendering ─────────────────────────── */
  const categories = formData.type === "expense"
    ? EXPENSE_CATEGORIES
    : INCOME_CATEGORIES;

  const isEditing = Boolean(editing);

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div className="card transaction-form">
      {/* Header */}
      <div className="card__header">
        <p className="section-heading">
          {isEditing ? "Edit Transaction" : "Add Transaction"}
        </p>
      </div>

      <div className="card__body">
        {/* ── Type toggle (Income / Expense) ───────────────────── */}
        <div className="type-toggle">
          {["expense", "income"].map((t) => (
            <button
              key={t}
              className={`type-toggle__btn ${formData.type === t ? `type-toggle__btn--active-${t}` : ""}`}
              onClick={() => handleChange({ target: { name: "type", value: t } })}
            >
              {t === "expense" ? "↓ Expense" : "↑ Income"}
            </button>
          ))}
        </div>

        {/* ── Amount + Date row ─────────────────────────────────── */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="amount">Amount ($)</label>
            <input
              id="amount"
              name="amount"
              type="number"
              min="0"
              step="0.01"
              className="form-input form-input--mono"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="date">Date</label>
            <input
              id="date"
              name="date"
              type="date"
              className="form-input"
              value={formData.date}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* ── Category select ───────────────────────────────────── */}
        <div className="form-group">
          <label className="form-label" htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            className="form-input"
            value={formData.category}
            onChange={handleChange}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* ── Description ───────────────────────────────────────── */}
        <div className="form-group">
          <label className="form-label" htmlFor="description">Description</label>
          <input
            id="description"
            name="description"
            type="text"
            className="form-input"
            value={formData.description}
            onChange={handleChange}
            placeholder="Optional note…"
          />
        </div>

        {/* ── Validation error ──────────────────────────────────── */}
        {error && <p className="form-error">{error}</p>}

        {/* ── Action buttons ────────────────────────────────────── */}
        <div className="form-actions">
          <button className="btn-primary" onClick={handleSubmit}>
            {isEditing ? "Update Transaction" : "Add Transaction"}
          </button>
          {isEditing && (
            <button className="btn-ghost" onClick={() => { onDone(); setError(""); }}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TransactionForm;
