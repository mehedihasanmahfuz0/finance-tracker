/**
 * ============================================================
 * FILE: src/context/financeReducer.js
 * ============================================================
 *
 * PURPOSE:
 *   This is the heart of the state-management layer.  A reducer
 *   is a *pure function* — given the same (state, action) pair it
 *   will always return the same new state and produce zero side
 *   effects (no API calls, no DOM mutations, no random numbers).
 *
 * SIGNATURE:
 *   (currentState, action) → nextState
 *
 * IMMUTABILITY RULES (critical):
 *   • Never mutate `state` directly.  Always spread it.
 *   • For arrays use [...arr, newItem], arr.filter(), arr.map().
 *   • For objects use { ...obj, key: newValue }.
 *   Mutating state would break React's change-detection because
 *   useReducer uses reference equality to decide whether to re-render.
 *
 * WHY KEEP IT SEPARATE FROM THE CONTEXT FILE?
 *   The reducer is pure business logic — it has no knowledge of
 *   React, JSX or the DOM.  Keeping it isolated makes it trivially
 *   testable with plain Jest/Vitest unit tests.
 * ============================================================
 */

import {
  ADD_TRANSACTION,
  DELETE_TRANSACTION,
  EDIT_TRANSACTION,
  SET_BUDGET,
  SET_FILTER,
} from "./actions";

/**
 * financeReducer
 * --------------
 * @param {Object} state   - The current global state snapshot.
 * @param {Object} action  - An object with at minimum a `type` string
 *                           and optionally a `payload` carrying data.
 * @returns {Object}       - A brand-new state object (never the same ref).
 */
function financeReducer(state, action) {
  switch (action.type) {

    /* -------------------------------------------------------
     * ADD_TRANSACTION
     * Payload: a complete transaction object (already has an id
     * generated in the component before dispatching).
     * Strategy: spread the current transactions array and append
     * the new one at the end → O(n) copy, O(1) append.
     * ------------------------------------------------------- */
    case ADD_TRANSACTION:
      return {
        ...state,
        transactions: [...state.transactions, action.payload],
      };

    /* -------------------------------------------------------
     * DELETE_TRANSACTION
     * Payload: the `id` string of the transaction to remove.
     * Strategy: Array.filter creates a new array excluding the
     * matched id — the original array is never touched.
     * ------------------------------------------------------- */
    case DELETE_TRANSACTION:
      return {
        ...state,
        transactions: state.transactions.filter(
          (tx) => tx.id !== action.payload
        ),
      };

    /* -------------------------------------------------------
     * EDIT_TRANSACTION
     * Payload: the *entire* updated transaction object (same id,
     * changed fields).
     * Strategy: Array.map walks every transaction.  When the id
     * matches we swap in the payload; all others pass through.
     * This preserves array order, which matters for the UI.
     * ------------------------------------------------------- */
    case EDIT_TRANSACTION:
      return {
        ...state,
        transactions: state.transactions.map((tx) =>
          tx.id === action.payload.id ? action.payload : tx
        ),
      };

    /* -------------------------------------------------------
     * SET_BUDGET
     * Payload: { category: string, limit: number }
     * Strategy: check whether a budget for this category already
     * exists.  If yes → map over the budgets array and replace
     * the matching entry.  If no → append a new budget object.
     * This keeps the "upsert" logic inside the reducer where it
     * belongs, away from UI code.
     * ------------------------------------------------------- */
    case SET_BUDGET: {
      const alreadyExists = state.budgets.some(
        (b) => b.category === action.payload.category
      );

      return {
        ...state,
        budgets: alreadyExists
          ? state.budgets.map((b) =>
              b.category === action.payload.category ? action.payload : b
            )
          : [...state.budgets, action.payload],
      };
    }

    /* -------------------------------------------------------
     * SET_FILTER
     * Payload: a *partial* filters object, e.g. { category: "Food" }
     * Strategy: spread the existing filters first, then overwrite
     * only the keys present in the payload.  This means the caller
     * only has to send what changed — not the entire filter object.
     * ------------------------------------------------------- */
    case SET_FILTER:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };

    /* -------------------------------------------------------
     * DEFAULT
     * Any unrecognised action type falls here.  Returning the
     * existing state unchanged is the correct behaviour for
     * initialisation (React calls the reducer once with an
     * internal @@INIT action) and for third-party middleware.
     * ------------------------------------------------------- */
    default:
      return state;
  }
}

export default financeReducer;
