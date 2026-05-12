import { useState, useEffect } from 'react';

// rrd imports
import { Form, Link } from "react-router-dom";

// library imports
import { BanknotesIcon, TrashIcon } from "@heroicons/react/24/outline";

// helper functions
import {
  calculateSpentByBudget,
  formatCurrency,
  formatPercentage,
} from "../helpers";

const BudgetItem = ({ budget, showDelete = false }) => {
  const { id, name, amount, color } = budget;
  const [spent, setSpent] = useState(0);

  useEffect(() => {
    calculateSpentByBudget(id).then(setSpent);
  }, [id]);

  const progressPercent = amount > 0 ? (spent / amount) * 100 : 0;

  return (
    <div className="budget" style={{ "--backdrop": `${color}` }}>
      <div className="progress-text">
        <h3>{name}</h3>
        <p>{formatCurrency(amount)}</p>
      </div>
      <div className="custom-progress-bg">
        <div 
          className={`custom-progress-fill ${progressPercent >= 100 ? 'bg-danger' : progressPercent >= 80 ? 'bg-warning' : 'bg-success'}`}
          style={{ width: `${Math.min(progressPercent, 100)}%` }}
        ></div>
      </div>
      <div className="progress-text">
        <small>{formatCurrency(spent)} spent</small>
        <small>{formatCurrency(amount - spent)} remaining</small>
      </div>
      <div className="progress-text">
        <small className={progressPercent >= 100 ? 'text-danger' : progressPercent >= 80 ? 'text-warning' : 'text-success'}>
          {progressPercent.toFixed(1)}%
        </small>
        <small className="muted">
          {Math.max(((amount - spent) / amount) * 100, 0).toFixed(1)}%
        </small>
      </div>
      {showDelete ? (
        <div className="flex-sm">
          <Form method="post" action={`/budget/${id}/delete`}>
            <button type="submit" className="btn btn--warning" style={{ width: '100%' }}>
              <span>Delete Budget</span>
              <TrashIcon width={20} />
            </button>
          </Form>
        </div>
      ) : (
        <div className="flex-sm">
          <Link to={`/budget/${id}`} className="btn">
            <span>View Details</span>
            <BanknotesIcon width={20} />
          </Link>
        </div>
      )}
    </div>
  );
};
export default BudgetItem;