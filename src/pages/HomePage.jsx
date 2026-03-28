/**
 * ============================================================
 * FILE: src/pages/HomePage.jsx
 * ============================================================
 *
 * PURPOSE:
 *   The single page of this SPA.  Acts as the router/coordinator
 *   between the four main sections: Dashboard, Transactions,
 *   Budgets, and Analytics.
 *
 * RESPONSIBILITIES:
 *   • Own `activeTab`  — which section is currently visible.
 *   • Own `editing`    — the transaction object currently being
 *                        edited (null when in "add" mode).
 *   • Render the app shell (header + tab navigation).
 *   • Render the active section.
 *
 * WHY IS `editing` STATE HERE (not in Context)?
 *   The editing state is transient UI state — it controls which
 *   component shows a pre-filled form.  It has nothing to do with
 *   the persisted data model.  Placing UI-only state in the global
 *   reducer would pollute the domain model with view concerns.
 *   React's local useState is the right tool for this.
 *
 * HOW EDIT WORKS (data flow):
 *   1. User clicks "Edit" on a TransactionItem.
 *   2. TransactionItem calls onEdit(transaction).
 *   3. TransactionList passes that up through its own onEdit prop.
 *   4. HomePage sets editing = transaction via setEditing().
 *   5. TransactionForm receives editing and pre-fills its fields.
 *   6. On submit → EDIT_TRANSACTION dispatched → state updated.
 *   7. TransactionForm calls onDone() → HomePage calls setEditing(null).
 * ============================================================
 */

import React, { useState } from "react";
import Dashboard        from "../components/dashboard/Dashboard";
import TransactionForm  from "../components/transactions/TransactionForm";
import TransactionList  from "../components/transactions/TransactionList";
import BudgetSection    from "../components/budgets/BudgetSection";
import Charts           from "../components/analytics/Charts";

const TABS = ["dashboard", "transactions", "budgets", "analytics"];

function HomePage() {
  /* ── UI-only state (not in global Context) ─────────────────── */
  const [activeTab, setActiveTab] = useState("dashboard");
  const [editing,   setEditing]   = useState(null); // Transaction | null

  /* ── Helpers ─────────────────────────────────────────────────
   * Passed as callbacks so child components don't import setState.
   * ─────────────────────────────────────────────────────────── */

  // Called when Dashboard wants to deep-link to the Transactions tab
  function goToTransactions() {
    setActiveTab("transactions");
  }

  // Called when TransactionItem "Edit" is clicked
  function handleEdit(transaction) {
    setEditing(transaction);
    setActiveTab("transactions"); // Switch to the Transactions tab
  }

  // Called when TransactionForm completes (add or edit) or cancels
  function handleFormDone() {
    setEditing(null);
  }

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div className="app-shell">
      {/* ── App header ─────────────────────────────────────────── */}
      <header className="app-header">
        <div className="app-header__brand">
          <div className="app-header__logo">$</div>
          <div>
            <span className="app-header__title">FinanceOS</span>
            <span className="app-header__sub">Personal Budget Tracker</span>
          </div>
        </div>
        <span className="app-header__date">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long", year: "numeric", month: "long", day: "numeric",
          })}
        </span>
      </header>

      {/* ── Tab navigation ─────────────────────────────────────── */}
      <nav className="tab-nav" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            className={`tab-nav__btn ${activeTab === tab ? "tab-nav__btn--active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      {/* ── Page content ───────────────────────────────────────── */}
      <main className="page-content">

        {/* Dashboard tab */}
        {activeTab === "dashboard" && (
          <Dashboard onGoTransactions={goToTransactions} />
        )}

        {/* Transactions tab — form on the left, list on the right */}
        {activeTab === "transactions" && (
          <div className="transactions-layout">
            {/*
             * TransactionForm:
             *   - editing=null  → "Add" mode
             *   - editing=<obj> → "Edit" mode (form pre-filled)
             */}
            <TransactionForm editing={editing} onDone={handleFormDone} />

            {/*
             * TransactionList passes onEdit up to us so we can
             * set the editing state and switch back here if needed.
             */}
            <TransactionList onEdit={handleEdit} />
          </div>
        )}

        {/* Budgets tab */}
        {activeTab === "budgets" && <BudgetSection />}

        {/* Analytics tab */}
        {activeTab === "analytics" && <Charts />}

      </main>
    </div>
  );
}

export default HomePage;
