/**
 * ============================================================
 * FILE: src/context/actions.js
 * ============================================================
 *
 * PURPOSE:
 *   Defines all "action type" constants used throughout the app.
 *   Centralising them here prevents typos (a mistyped string like
 *   "ADD_TRANSACTON" would silently fail in a switch-case) and
 *   makes it easy to see every possible state change at a glance.
 *
 * PATTERN:
 *   The value of each constant is a plain string.  The convention
 *   SCREAMING_SNAKE_CASE is borrowed from Flux/Redux and is
 *   widely understood in the React community.
 *
 * HOW TO USE:
 *   Import the constant you need instead of the raw string:
 *
 *     import { ADD_TRANSACTION } from '../context/actions';
 *     dispatch({ type: ADD_TRANSACTION, payload: newTx });
 *
 *   Then reference the same constant in the reducer's switch block.
 * ============================================================
 */

/** Adds a brand-new transaction object to state.transactions. */
export const ADD_TRANSACTION    = "ADD_TRANSACTION";

/** Permanently removes a transaction by its id from state.transactions. */
export const DELETE_TRANSACTION = "DELETE_TRANSACTION";

/** Replaces an existing transaction (matched by id) with updated data. */
export const EDIT_TRANSACTION   = "EDIT_TRANSACTION";

/**
 * Creates a new budget entry for a category, or updates the spending
 * limit if a budget for that category already exists.
 */
export const SET_BUDGET = "SET_BUDGET";

/**
 * Updates one or more fields inside state.filters.
 * The payload is a partial object, e.g. { category: "Food" } or
 * { sortBy: "amount" } — only the supplied keys are overwritten.
 */
export const SET_FILTER = "SET_FILTER";
