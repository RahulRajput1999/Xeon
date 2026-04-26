const STORAGE_KEY = 'xeon-expenses';
let expenses = [];
let editId = null;
let monthlyChart; 
let annualChart;

const expenseForm = document.getElementById('expense-form');
const vendorInput = document.getElementById('vendor');
const descriptionInput = document.getElementById('description');
const categoryInput = document.getElementById('category');
const amountInput = document.getElementById('amount');
const dateInput = document.getElementById('date');
const saveButton = document.getElementById('save-button');
const cancelEditButton = document.getElementById('cancel-edit');
const expensesBody = document.getElementById('expenses-body');
const totalAll = document.getElementById('total-all');
const totalMonth = document.getElementById('total-month');
const totalYear = document.getElementById('total-year');
const monthlyCanvas = document.getElementById('monthlyChart');
const annualCanvas = document.getElementById('annualChart');

function loadExpenses() {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      expenses = JSON.parse(stored);
    } catch (error) {
      expenses = [];
    }
  }
}

function saveExpenses() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

function formatCurrency(value) {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getTotals() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const totals = {
    all: 0,
    month: 0,
    year: 0,
  };

  expenses.forEach((expense) => {
    const amount = Number(expense.amount);
    totals.all += amount;
    const expenseDate = new Date(expense.date);
    if (expenseDate.getFullYear() === currentYear) {
      totals.year += amount;
      if (expenseDate.getMonth() === currentMonth) {
        totals.month += amount;
      }
    }
  });

  return totals;
}

function buildMonthlySeries() {
  const now = new Date();
  const year = now.getFullYear();
  const monthTotals = Array(12).fill(0);

  expenses.forEach((expense) => {
    const expenseDate = new Date(expense.date);
    if (expenseDate.getFullYear() === year) {
      monthTotals[expenseDate.getMonth()] += Number(expense.amount);
    }
  });

  return monthTotals;
}

function buildAnnualSeries() {
  const yearMap = new Map();

  expenses.forEach((expense) => {
    const expenseDate = new Date(expense.date);
    const year = expenseDate.getFullYear();
    yearMap.set(year, (yearMap.get(year) || 0) + Number(expense.amount));
  });

  const years = Array.from(yearMap.keys()).sort((a, b) => a - b);
  const totals = years.map((year) => yearMap.get(year));
  return { years, totals };
}

function renderTotals() {
  const totals = getTotals();
  totalAll.textContent = formatCurrency(totals.all);
  totalMonth.textContent = formatCurrency(totals.month);
  totalYear.textContent = formatCurrency(totals.year);
}

function renderExpenses() {
  expensesBody.innerHTML = '';

  if (expenses.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 6;
    cell.textContent = 'No expenses added yet.';
    cell.style.padding = '1rem';
    row.appendChild(cell);
    expensesBody.appendChild(row);
    return;
  }

  expenses
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach((expense) => {
      const row = document.createElement('tr');

      row.innerHTML = `
        <td>${formatDate(expense.date)}</td>
        <td>${expense.vendor}</td>
        <td>${expense.description}</td>
        <td>${expense.category}</td>
        <td>${formatCurrency(Number(expense.amount))}</td>
        <td class="actions-col">
          <button class="action-btn edit" data-id="${expense.id}" type="button">Edit</button>
          <button class="action-btn delete" data-id="${expense.id}" type="button">Delete</button>
        </td>
      `;

      expensesBody.appendChild(row);
    });
}

function updateCharts() {
  const monthlyTotals = buildMonthlySeries();
  const monthLabels = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const annualData = buildAnnualSeries();

  if (monthlyChart) {
    monthlyChart.data.datasets[0].data = monthlyTotals;
    monthlyChart.update();
  } else {
    monthlyChart = new Chart(monthlyCanvas, {
      type: 'line',
      data: {
        labels: monthLabels,
        datasets: [
          {
            label: 'Monthly Spend',
            data: monthlyTotals,
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.18)',
            fill: true,
            tension: 0.35,
            pointRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            grid: { display: false },
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `$${value}`,
            },
          },
        },
      },
    });
  }

  if (annualChart) {
    annualChart.data.labels = annualData.years;
    annualChart.data.datasets[0].data = annualData.totals;
    annualChart.update();
  } else {
    annualChart = new Chart(annualCanvas, {
      type: 'bar',
      data: {
        labels: annualData.years,
        datasets: [
          {
            label: 'Annual Spend',
            data: annualData.totals,
            backgroundColor: '#4338ca',
            borderRadius: 12,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            grid: { display: false },
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `$${value}`,
            },
          },
        },
      },
    });
  }
}

function clearForm() {
  expenseForm.reset();
  editId = null;
  saveButton.textContent = 'Add Expense';
  cancelEditButton.classList.add('hidden');
}

function populateForm(expense) {
  vendorInput.value = expense.vendor;
  descriptionInput.value = expense.description;
  categoryInput.value = expense.category;
  amountInput.value = expense.amount;
  dateInput.value = expense.date;
  saveButton.textContent = 'Update Expense';
  cancelEditButton.classList.remove('hidden');
}

function handleFormSubmit(event) {
  event.preventDefault();

  const newEntry = {
    id: editId || Date.now().toString(),
    vendor: vendorInput.value.trim(),
    description: descriptionInput.value.trim(),
    category: categoryInput.value,
    amount: Number(amountInput.value).toFixed(2),
    date: dateInput.value,
  };

  if (!newEntry.vendor || !newEntry.description || !newEntry.category || !newEntry.amount || !newEntry.date) {
    return;
  }

  if (editId) {
    expenses = expenses.map((item) => (item.id === editId ? newEntry : item));
  } else {
    expenses.push(newEntry);
  }

  saveExpenses();
  renderApp();
  expenseForm.reset();
  clearForm();
}

function handleTableClick(event) {
  const target = event.target.closest('button');
  if (!target) return;

  const id = target.dataset.id;
  const action = target.classList.contains('edit') ? 'edit' : target.classList.contains('delete') ? 'delete' : null;
  if (!action) return;

  if (action === 'delete') {
    expenses = expenses.filter((expense) => expense.id !== id);
    saveExpenses();
    renderApp();
    if (editId === id) {
      clearForm();
    }
  }

  if (action === 'edit') {
    const expense = expenses.find((item) => item.id === id);
    if (!expense) return;
    editId = id;
    populateForm(expense);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function renderApp() {
  renderExpenses();
  renderTotals();
  updateCharts();
}

expenseForm.addEventListener('submit', handleFormSubmit);
cancelEditButton.addEventListener('click', () => {
  clearForm();
});
expensesBody.addEventListener('click', handleTableClick);

window.addEventListener('DOMContentLoaded', () => {
  loadExpenses();
  if (dateInput) {
    const today = new Date().toISOString().slice(0, 10);
    dateInput.value = today;
  }
  renderApp();
});
