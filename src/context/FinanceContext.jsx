/**
 * ============================================================
 * FILE: src/context/FinanceContext.jsx
 * ============================================================
 *
 * PURPOSE:
 *   Sets up the React Context + useReducer pair that serves as the
 *   single source of truth for the entire application.
 *
 * EXPORTS:
 *   FinanceProvider  – wraps the component tree; must sit near the
 *                      root so every consumer can reach it.
 *   useFinance       – custom hook; any component calls this to get
 *                      { state, dispatch } without knowing about the
 *                      context object itself.
 *
 * WHY CONTEXT + useReducer (not useState)?
 *   useState is great for local component state.  Once multiple
 *   unrelated components need the SAME piece of state the options
 *   are:
 *     a) Lift state up → causes "prop drilling" through many layers.
 *     b) Context API   → components subscribe directly; no drilling.
 *   useReducer replaces useState when the state transitions are
 *   complex (multiple fields, conditional logic).  It also makes the
 *   update logic *testable in isolation* (the reducer file).
 *
 * DATA FLOW (unidirectional):
 *   UI Component
 *     → dispatch({ type, payload })
 *       → financeReducer(currentState, action)
 *         → returns nextState
 *           → React re-renders subscribed consumers
 * ============================================================
 */

import React, { createContext, useContext, useReducer } from "react";
import financeReducer from "./financeReducer";
import initialState   from "../data/initialState";

/* ----------------------------------------------------------------
 * 1. Create the Context object.
 *    The default value (null) is only used if a component tries to
 *    consume the context *outside* of FinanceProvider — our custom
 *    hook below throws a helpful error in that case.
 * ---------------------------------------------------------------- */
export const FinanceContext = createContext(null);

/* ----------------------------------------------------------------
 * 2. FinanceProvider — the Context "publisher"
 *
 *    useReducer(reducer, initialState) returns:
 *      state    – the current snapshot of the global state tree
 *      dispatch – a stable function reference; calling it with an
 *                 action object runs the reducer and schedules a
 *                 React re-render of all subscribed consumers.
 *
 *    We expose both via the Context value so any nested component
 *    can both READ state and TRIGGER changes.
 * ---------------------------------------------------------------- */
export function FinanceProvider({ children }) {
  const [state, dispatch] = useReducer(financeReducer, initialState);

  /*
   * The value prop is what every consumer receives.
   * We do NOT memoize this object with useMemo because `state` and
   * `dispatch` already have stable / correctly-updated references
   * managed by React.  Adding useMemo here would be premature
   * optimisation and could introduce subtle stale-closure bugs.
   */
  const contextValue = { state, dispatch };

  return (
    <FinanceContext.Provider value={contextValue}>
      {children}
    </FinanceContext.Provider>
  );
}

/* ----------------------------------------------------------------
 * 3. useFinance — the Context "subscriber" hook
 *
 *    Encapsulates useContext(FinanceContext) so that:
 *      a) Components import one thing instead of two (the hook,
 *         not the raw Context object).
 *      b) We can add a guard that catches the common mistake of
 *         using the hook outside its provider.
 *
 *    Usage in any child component:
 *      const { state, dispatch } = useFinance();
 * ---------------------------------------------------------------- */
export function useFinance() {
  const context = useContext(FinanceContext);

  if (!context) {
    throw new Error(
      "useFinance() must be called inside a <FinanceProvider>.  " +
      "Make sure FinanceProvider wraps your component tree in App.jsx."
    );
  }

  return context;
}
