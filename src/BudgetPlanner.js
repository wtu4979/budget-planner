import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { v4 as uuid } from "uuid";
import {
  PieChart,
  Pie,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts";

// Helper: currency formatter
const fmt = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const STORAGE_KEY = "budget-planner-v1";

function usePersistentState(defaultValue) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  return [state, setState];
}

export default function BudgetPlanner() {
  const [data, setData] = usePersistentState({
    incomes: [
      { id: uuid(), name: "Primary Paycheck", amount: 0 },
    ],
    expenses: [
      { id: uuid(), name: "Rent / Mortgage", amount: 0 },
      { id: uuid(), name: "Credit Cards", amount: 0 },
      { id: uuid(), name: "Utilities & Internet", amount: 0 },
      { id: uuid(), name: "Insurance", amount: 0 },
      { id: uuid(), name: "Groceries", amount: 0 },
      { id: uuid(), name: "Transport", amount: 0 },
      { id: uuid(), name: "Subscriptions", amount: 0 },
    ],
    note: "",
    currency: "USD",
  });

  const totalIncome = useMemo(
    () => data.incomes.reduce((s, x) => s + (Number(x.amount) || 0), 0),
    [data.incomes]
  );
  const totalExpenses = useMemo(
    () => data.expenses.reduce((s, x) => s + (Number(x.amount) || 0), 0),
    [data.expenses]
  );
  const remaining = totalIncome - totalExpenses;

  const pieData = useMemo(() => {
    const base = data.expenses
      .filter((e) => Number(e.amount) > 0)
      .map((e) => ({ name: e.name, value: Number(e.amount) }));
    return base.length ? base : [{ name: "No expenses", value: 1 }];
  }, [data.expenses]);

  const COLORS = [
    "#0ea5e9",
    "#22c55e",
    "#f97316",
    "#a855f7",
    "#eab308",
    "#ef4444",
    "#14b8a6",
    "#8b5cf6",
  ];

  function updateRow(kind, id, patch) {
    setData((d) => ({
      ...d,
      [kind]: d[kind].map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));
  }

  function addRow(kind) {
    setData((d) => ({
      ...d,
      [kind]: [...d[kind], { id: uuid(), name: "New Item", amount: 0 }],
    }));
  }

  function removeRow(kind, id) {
    setData((d) => ({
      ...d,
      [kind]: d[kind].filter((r) => r.id !== id),
    }));
  }

  function resetAll() {
    if (!window.confirm("Reset all values?")) return;
    setData({
      incomes: [{ id: uuid(), name: "Primary Paycheck", amount: 0 }],
      expenses: [
        { id: uuid(), name: "Rent / Mortgage", amount: 0 },
        { id: uuid(), name: "Credit Cards", amount: 0 },
        { id: uuid(), name: "Utilities & Internet", amount: 0 },
        { id: uuid(), name: "Insurance", amount: 0 },
        { id: uuid(), name: "Groceries", amount: 0 },
        { id: uuid(), name: "Transport", amount: 0 },
        { id: uuid(), name: "Subscriptions", amount: 0 },
      ],
      note: "",
      currency: "USD",
    });
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/80 border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Monthly Budget Planner</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={resetAll}
              className="px-3 py-2 rounded-xl border border-neutral-300 hover:border-neutral-400 active:scale-[.98] transition shadow-sm bg-white"
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 grid gap-6 md:grid-cols-2">
        {/* Income Card */}
        <section className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Income</h2>
            <button
              onClick={() => addRow("incomes")}
              className="text-sm px-3 py-1.5 rounded-xl bg-neutral-900 text-white hover:opacity-90 active:scale-[.98]"
            >
              Add Income
            </button>
          </div>
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {data.incomes.map((row) => (
                <motion.div
                  key={row.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="grid grid-cols-12 gap-3 items-center"
                >
                  <input
                    className="col-span-7 sm:col-span-8 px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    value={row.name}
                    onChange={(e) => updateRow("incomes", row.id, { name: e.target.value })}
                    placeholder="Name (e.g., Paycheck)"
                  />
                  <div className="col-span-4 sm:col-span-3 flex items-center gap-2">
                    <span className="text-neutral-500">$</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      value={row.amount}
                      onChange={(e) =>
                        updateRow("incomes", row.id, { amount: Number(e.target.value) })
                      }
                      min={0}
                    />
                  </div>
                  <button
                    onClick={() => removeRow("incomes", row.id)}
                    className="col-span-1 text-neutral-500 hover:text-red-600"
                    aria-label={`Remove ${row.name}`}
                  >
                    ×
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-200 flex items-center justify-between">
            <span className="text-sm text-neutral-500">Total Income</span>
            <span className="text-lg font-semibold">{fmt.format(totalIncome)}</span>
          </div>
        </section>

        {/* Expenses Card */}
        <section className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Expenses</h2>
            <button
              onClick={() => addRow("expenses")}
              className="text-sm px-3 py-1.5 rounded-xl bg-neutral-900 text-white hover:opacity-90 active:scale-[.98]"
            >
              Add Expense
            </button>
          </div>
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {data.expenses.map((row) => (
                <motion.div
                  key={row.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="grid grid-cols-12 gap-3 items-center"
                >
                  <input
                    className="col-span-7 sm:col-span-8 px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    value={row.name}
                    onChange={(e) => updateRow("expenses", row.id, { name: e.target.value })}
                    placeholder="Name (e.g., Rent)"
                  />
                  <div className="col-span-4 sm:col-span-3 flex items-center gap-2">
                    <span className="text-neutral-500">$</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      value={row.amount}
                      onChange={(e) =>
                        updateRow("expenses", row.id, { amount: Number(e.target.value) })
                      }
                      min={0}
                    />
                  </div>
                  <button
                    onClick={() => removeRow("expenses", row.id)}
                    className="col-span-1 text-neutral-500 hover:text-red-600"
                    aria-label={`Remove ${row.name}`}
                  >
                    ×
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-200 flex items-center justify-between">
            <span className="text-sm text-neutral-500">Total Expenses</span>
            <span className="text-lg font-semibold">{fmt.format(totalExpenses)}</span>
          </div>
        </section>

        {/* Summary / Chart */}
        <section className="md:col-span-2 grid gap-6 md:grid-cols-5">
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 sm:p-6 md:col-span-3">
            <h3 className="text-lg font-semibold mb-3">Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Stat label="Income" value={fmt.format(totalIncome)} />
              <Stat label="Expenses" value={fmt.format(totalExpenses)} />
              <Stat
                label="Leftover"
                value={fmt.format(remaining)}
                accent={remaining >= 0 ? "positive" : "negative"}
              />
            </div>

            <div className="mt-4">
              {remaining < 0 ? (
                <div className="rounded-xl bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm">
                  You are over budget by <b>{fmt.format(Math.abs(remaining))}</b>. Consider reducing expenses or increasing income.
                </div>
              ) : remaining === 0 ? (
                <div className="rounded-xl bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 text-sm">
                  You are breaking even. You might want to set aside some savings.
                </div>
              ) : (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 text-sm">
                  Nice! You have <b>{fmt.format(remaining)}</b> remaining this month.
                </div>
              )}
            </div>

            <div className="mt-6">
              <label className="block text-sm text-neutral-500 mb-2">Notes</label>
              <textarea
                value={data.note}
                onChange={(e) => setData((d) => ({ ...d, note: e.target.value }))}
                placeholder="Any reminders or goals for this month (e.g., save $500, pay down Visa)."
                className="w-full h-24 px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 sm:p-6 md:col-span-2">
            <h3 className="text-lg font-semibold mb-3">Expenses Breakdown</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    innerRadius={50}
                    paddingAngle={2}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => fmt.format(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-1 max-h-32 overflow-auto pr-1">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded"
                      style={{ background: COLORS[i % COLORS.length] }}
                    />
                    <span className="text-neutral-600 truncate max-w-[12rem]">{d.name}</span>
                  </div>
                  <span className="font-medium">{fmt.format(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer Tips */}
        <section className="md:col-span-2 text-xs text-neutral-500 flex flex-wrap items-center gap-3">
          <span>• Your values are saved locally to your device.</span>
          <span>• Add or remove any line items to match your real budget.</span>
          <span>• Pro tip: Track savings as an "expense" to pay yourself first.</span>
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value, accent }) {
  const accentClasses =
    accent === "positive"
      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
      : accent === "negative"
      ? "bg-red-50 border-red-200 text-red-800"
      : "bg-neutral-50 border-neutral-200";
  return (
    <div
      className={`rounded-2xl border ${accentClasses} p-4 flex flex-col gap-1 min-h-[92px]`}
    >
      <span className="text-xs uppercase tracking-wide text-neutral-500">{label}</span>
      <span className="text-xl font-semibold">{value}</span>
    </div>
  );
} 