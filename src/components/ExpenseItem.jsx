import { Link, useFetcher } from "react-router-dom";
import { useState, useEffect } from 'react';
import { toast } from "react-toastify";
import { TrashIcon, PencilIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import {
  formatCurrency,
  formatDateToLocaleString,
  updateExpense,
  getAllMatchingItems,
} from "../helpers";
import { getExpenseCategoryMeta } from "./AddExpenseForm";

const ExpenseItem = ({ expense, showBudget }) => {
  const fetcher = useFetcher();
  const [editing, setEditing] = useState(false);
  const [editedExpense, setEditedExpense] = useState({ ...expense });
  const [budget, setBudget] = useState(null);

  useEffect(() => {
    if (showBudget) {
      const budgetId = expense.budget || expense.budgetId;
      getAllMatchingItems({
        category: "budgets",
        key: "id",
        value: budgetId,
      }).then(items => setBudget(items[0] || null));
    }
  }, [expense, showBudget]);

  const handleEditSubmit = async () => {
    try {
      await updateExpense(expense.id, editedExpense);
      toast.success('Expense updated successfully');
      setEditing(false);
    } catch (error) {
      toast.error('Error updating expense');
    }
  };

  const { icon: catIcon, label: catLabel } = getExpenseCategoryMeta(expense.category);

  return (
    <>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="category-badge" title={catLabel}>{catIcon} {catLabel}</span>
          {editing ? (
            <input
              type="text"
              value={editedExpense.name}
              onChange={(e) =>
                setEditedExpense((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          ) : (
            <span style={{ fontWeight: 600 }}>{expense.name}</span>
          )}
        </div>
      </td>
      <td>
        {editing ? (
          <input
            type="number"
            step="1"
            value={editedExpense.amount}
            onChange={(e) =>
              setEditedExpense((prev) => ({ ...prev, amount: +e.target.value }))
            }
          />
        ) : (
          formatCurrency(expense.amount)
        )}
      </td>
      <td>{formatDateToLocaleString(expense.createdAt)}</td>
      {showBudget && (
        <td>
          {budget ? (
            <Link to={`/budget/${budget.id}`}>{budget.name}</Link>
          ) : (
            <span>-</span>
          )}
        </td>
      )}
      <td>
        {editing ? (
          <div className="edit-form-buttons">
            <button onClick={handleEditSubmit} className="btn btn--dark">
              <CheckCircleIcon width={20} />
            </button>
            <button onClick={() => setEditing(false)} className="btn btn--light">
              <XCircleIcon width={20} />
            </button>
          </div>
        ) : (
          <div className="edit-buttons">
            <button onClick={() => setEditing(true)} className="btn btn--dark">
              Edit <PencilIcon width={20} />
            </button>
          </div>
        )}
      </td>
      <td>
        <fetcher.Form method="post">
          <input type="hidden" name="_action" value="deleteExpense" />
          <input type="hidden" name="expenseId" value={expense.id} />
          <button
            type="submit"
            className="btn btn--warning"
            aria-label={`Delete ${expense.name} expense`}
          >
            <TrashIcon width={20} />
          </button>
        </fetcher.Form>
      </td>
    </>
  );
};

export default ExpenseItem;
