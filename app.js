const { useState, useEffect, useRef } = React;

function BudgetPlanner() {
  const [incomes, setIncomes] = useState(
    JSON.parse(localStorage.getItem("incomes")) || [
      { name: "", amount: "" }
    ]
  );
  const [expenses, setExpenses] = useState(
    JSON.parse(localStorage.getItem("expenses")) || [
      { name: "", amount: "" }
    ]
  );
  const chartRef = useRef(null);
  let chart;

  const addIncome = () => {
    setIncomes([...incomes, { name: "", amount: "" }]);
  };

  const addExpense = () => {
    setExpenses([...expenses, { name: "", amount: "" }]);
  };

  const updateIncome = (index, field, value) => {
    const updated = incomes.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setIncomes(updated);
  };
  const updateExpense = (index, field, value) => {
    const updated = expenses.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setExpenses(updated);
  };

  const totalIncome = incomes.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  );
  const totalExpense = expenses.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  );
  const leftover = totalIncome - totalExpense;

  const drawChart = () => {
    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext("2d");
    if (chart) {
      chart.destroy();
    }
    chart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: expenses.map((item) => item.name || "Item"),
        datasets: [
          {
            data: expenses.map((item) => parseFloat(item.amount) || 0),
            backgroundColor: expenses.map(
              () =>
                "hsl(" + Math.floor(Math.random() * 360) + ",70%,60%)"
            ),
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "right",
          },
        },
      },
    });
  };

  useEffect(() => {
    localStorage.setItem("incomes", JSON.stringify(incomes));
    localStorage.setItem("expenses", JSON.stringify(expenses));
    drawChart();
  }, [incomes, expenses]);

  return React.createElement(
    "div",
    { className: "max-w-xl mx-auto p-4" },
    React.createElement(
      "h1",
      { className: "text-2xl font-bold mb-4" },
      "Budget Planner"
    ),
    React.createElement(
      "div",
      { className: "mb-4" },
      React.createElement(
        "h2",
        { className: "text-xl font-semibold mb-2" },
        "Incomes"
      ),
      incomes.map((item, index) =>
        React.createElement(
          "div",
          { key: index, className: "flex space-x-2 mb-2" },
          React.createElement("input", {
            type: "text",
            className: "w-1/2 p-2 border rounded",
            placeholder: "Name",
            value: item.name,
            onChange: (e) =>
              updateIncome(index, "name", e.target.value),
          }),
          React.createElement("input", {
            type: "number",
            className: "w-1/3 p-2 border rounded",
            placeholder: "Amount",
            value: item.amount,
            onChange: (e) =>
              updateIncome(index, "amount", e.target.value),
          })
        )
      ),
      React.createElement(
        "button",
        {
          className: "px-3 py-1 bg-blue-600 text-white rounded",
          onClick: addIncome,
        },
        "Add Income"
      )
    ),
    React.createElement(
      "div",
      { className: "mb-4" },
      React.createElement(
        "h2",
        { className: "text-xl font-semibold mb-2" },
        "Expenses"
      ),
      expenses.map((item, index) =>
        React.createElement(
          "div",
          { key: index, className: "flex space-x-2 mb-2" },
          React.createElement("input", {
            type: "text",
            className: "w-1/2 p-2 border rounded",
            placeholder: "Name",
            value: item.name,
            onChange: (e) =>
              updateExpense(index, "name", e.target.value),
          }),
          React.createElement("input", {
            type: "number",
            className: "w-1/3 p-2 border rounded",
            placeholder: "Amount",
            value: item.amount,
            onChange: (e) =>
              updateExpense(index, "amount", e.target.value),
          })
        )
      ),
      React.createElement(
        "button",
        {
          className: "px-3 py-1 bg-blue-600 text-white rounded",
          onClick: addExpense,
        },
        "Add Expense"
      )
    ),
    React.createElement(
      "div",
      { className: "mb-4" },
      React.createElement(
        "p",
        { className: "mb-1" },
        "Total Income: $" + totalIncome.toFixed(2)
      ),
      React.createElement(
        "p",
        { className: "mb-1" },
        "Total Expenses: $" + totalExpense.toFixed(2)
      ),
      React.createElement(
        "p",
        { className: "font-semibold" },
        "Leftover: $" + leftover.toFixed(2)
      )
    ),
    React.createElement("canvas", {
      ref: chartRef,
      className: "w-full h-64",
    })
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  React.createElement(BudgetPlanner)
);
