import { useState, useEffect } from 'react';
import { useLoaderData, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { MagnifyingGlassIcon, FunnelIcon, ArrowDownTrayIcon, XMarkIcon, CalendarDaysIcon } from "@heroicons/react/24/solid";
import Table from "../components/Table";
import { deleteItem, fetchData, formatCurrency } from "../helpers";
import { EXPENSE_CATEGORIES } from "../components/AddExpenseForm";

export async function expensesLoader() {
  const expenses = await fetchData("expenses");
  const budgets = await fetchData("budgets");
  return { expenses, budgets };
}

export async function expensesAction({ request }) {
  const data = await request.formData();
  const { _action, ...values } = Object.fromEntries(data);
  if (_action === "deleteExpense") {
    try {
      await deleteItem({ key: "expenses", id: values.expenseId });
      return toast.success("Expense deleted!");
    } catch (e) {
      throw new Error("There was a problem deleting your expense.");
    }
  }
}

const categoryMap = Object.fromEntries(EXPENSE_CATEGORIES);

const ExpensesPage = () => {
  const { expenses, budgets } = useLoaderData();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState('date-desc');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch) setSearch(urlSearch);
  }, [searchParams]);

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  let filtered = expenses ? [...expenses] : [];

  if (search) {
    filtered = filtered.filter(e =>
      e.name.toLowerCase().includes(search.toLowerCase())
    );
  }
  if (minAmount) {
    filtered = filtered.filter(e => e.amount >= +minAmount);
  }
  if (maxAmount) {
    filtered = filtered.filter(e => e.amount <= +maxAmount);
  }
  if (selectedCategories.length > 0) {
    filtered = filtered.filter(e => selectedCategories.includes(e.category || 'other'));
  }
  if (dateFrom) {
    filtered = filtered.filter(e => new Date(e.createdAt) >= new Date(dateFrom));
  }
  if (dateTo) {
    filtered = filtered.filter(e => new Date(e.createdAt) <= new Date(dateTo + 'T23:59:59'));
  }

  switch (sortBy) {
    case 'date-desc':
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    case 'date-asc':
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      break;
    case 'amount-desc':
      filtered.sort((a, b) => b.amount - a.amount);
      break;
    case 'amount-asc':
      filtered.sort((a, b) => a.amount - b.amount);
      break;
    case 'name':
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
  }

  const totalFiltered = filtered.reduce((acc, e) => acc + e.amount, 0);
  const hasActiveFilters = search || minAmount || maxAmount || selectedCategories.length > 0 || dateFrom || dateTo;

  const clearAll = () => {
    setSearch(''); setMinAmount(''); setMaxAmount('');
    setSelectedCategories([]); setDateFrom(''); setDateTo('');
  };

  const exportCSV = () => {
    const headers = ['Name', 'Amount', 'Category', 'Date'];
    const rows = filtered.map(e => [
      e.name,
      e.amount,
      categoryMap[e.category]?.[1] || 'Other',
      new Date(e.createdAt).toLocaleDateString()
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budgetbrain-expenses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported!');
  };

  const exportPDF = () => {
    const printWindow = window.open('', '_blank');
    const rows = filtered.map((e, i) =>
      `<tr><td>${i + 1}</td><td>${e.name}</td><td>${categoryMap[e.category]?.[0] || '📦'} ${categoryMap[e.category]?.[1] || 'Other'}</td><td>₹${e.amount.toLocaleString()}</td><td>${new Date(e.createdAt).toLocaleDateString()}</td></tr>`
    ).join('');
    const html = `
      <html><head><title>BudgetBrain Expenses</title>
      <style>
        body{font-family:Inter,sans-serif;padding:40px;color:#1a1a2e}
        h1{color:#6d28d9;margin-bottom:8px}
        p{color:#666;margin-bottom:20px}
        table{width:100%;border-collapse:collapse}
        th,td{border:1px solid #e2e8f0;padding:10px 14px;text-align:left}
        th{background:#f8fafc;font-weight:600;color:#475569}
        tr:nth-child(even){background:#f8fafc}
        .total{font-weight:700;font-size:1.1em;margin-top:16px}
      </style></head><body>
      <h1>BudgetBrain — Expense Report</h1>
      <p>Generated on ${new Date().toLocaleDateString()} • ${filtered.length} expenses</p>
      <table><thead><tr><th>#</th><th>Name</th><th>Category</th><th>Amount</th><th>Date</th></tr></thead><tbody>
      ${rows}
      </tbody></table>
      <p class="total">Total: ₹${totalFiltered.toLocaleString()}</p>
      </body></html>`;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
    toast.success('PDF ready to print!');
  };

  return (
    <div className="grid-lg" style={{ width: '100%' }}>
      <div className="expenses-header">
        <h1>All Expenses</h1>
        <div className="expenses-actions">
          <button className="btn btn--dark" onClick={exportCSV} title="Export CSV">
            <ArrowDownTrayIcon width={18} />
            <span>CSV</span>
          </button>
          <button className="btn btn--outline" onClick={exportPDF} title="Export PDF">
            <ArrowDownTrayIcon width={18} />
            <span>PDF</span>
          </button>
        </div>
      </div>

      <div className="search-bar">
        <div className="search-input-wrap">
          <MagnifyingGlassIcon width={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="sort-select">
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="amount-desc">Highest Amount</option>
          <option value="amount-asc">Lowest Amount</option>
          <option value="name">Name (A-Z)</option>
        </select>
        <button
          className={`btn ${showFilters ? 'btn--dark' : 'btn--outline'}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <FunnelIcon width={18} />
          <span>Filters</span>
          {hasActiveFilters && <span className="filter-badge">{filtered.length}</span>}
        </button>
      </div>

      {showFilters && (
        <div className="filter-panel">
          <div className="filter-group">
            <label>Min Amount</label>
            <input type="number" value={minAmount} onChange={e => setMinAmount(e.target.value)} placeholder="₹0" />
          </div>
          <div className="filter-group">
            <label>Max Amount</label>
            <input type="number" value={maxAmount} onChange={e => setMaxAmount(e.target.value)} placeholder="₹99,999" />
          </div>
          <div className="filter-group">
            <label><CalendarDaysIcon width={14} style={{ display: 'inline' }} /> From</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div className="filter-group">
            <label><CalendarDaysIcon width={14} style={{ display: 'inline' }} /> To</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
          <button className="btn btn--outline" onClick={clearAll}>Clear All</button>
        </div>
      )}

      <div className="category-filter-chips">
        {EXPENSE_CATEGORIES.map(([key, [icon, label]]) => (
          <button
            key={key}
            className={`category-chip ${selectedCategories.includes(key) ? 'active' : ''}`}
            onClick={() => toggleCategory(key)}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      <div className="search-summary">
        <span>
          {filtered.length} expense{filtered.length !== 1 ? 's' : ''} found
          {hasActiveFilters && (
            <button className="clear-filters-btn" onClick={clearAll}>
              <XMarkIcon width={14} /> Clear
            </button>
          )}
        </span>
        <span className="search-summary-total">Total: {formatCurrency(totalFiltered)}</span>
      </div>

      {filtered.length > 0 ? (
        <div className="grid-md">
          <Table expenses={filtered} />
        </div>
      ) : (
        <div className="empty-state glass-card">
          <MagnifyingGlassIcon width={48} style={{ opacity: 0.3 }} />
          <h3>No expenses found</h3>
          <p style={{ color: 'hsl(215 20% 65%)' }}>Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};

export default ExpensesPage;
