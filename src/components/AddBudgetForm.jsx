// reacts
import { useEffect, useRef } from "react";

// rrd imports
import { Form, useFetcher } from "react-router-dom";

// library imports
import { CurrencyDollarIcon } from "@heroicons/react/24/solid";

const AddBudgetForm = () => {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === "submitting";

  // These refs will be used to interact with the form and focus on specific input elements.
  const formRef = useRef();
  const focusRef = useRef();

  useEffect(() => {
    if (!isSubmitting) {
      // If isSubmitting is false, reset the form using the reset method of the formRef,
      // and then focus on the input element referenced by focusRef.
      formRef.current.reset();
      focusRef.current.focus();
    }
  }, [isSubmitting]);

  return (
    <div className="form-wrapper">
      <h2 className="h3">Create budget</h2>
      {/* use the Form component to create a form element */}
      <fetcher.Form method="post" className="grid-sm" ref={formRef}>
        {/* This section defines an input field for the budget name. */}
        <div className="grid-xs">
          <label htmlFor="newBudget">Budget Name</label>
          <input
            type="text"
            name="newBudget"
            id="newBudget"
            placeholder="e.g., Furnitures"
            required
            ref={focusRef} // when the form is reset, then focus on the input element.
          />
        </div>
        <div className="grid-xs">
          <label htmlFor="newBudgetAmount">Amount</label>
          <input
            type="number"
            step="1"
            name="newBudgetAmount"
            id="newBudgetAmount"
            placeholder="e.g., ₹400"
            required
            inputMode="decimal"
          />
        </div>
        <input type="hidden" name="_action" value="createBudget" />
        <button type="submit" className="btn btn--dark" disabled={isSubmitting}>
          {
            // If submitting, display "Submitting...";
            // otherwise, display "Create budget" along with a currency symbol.
            isSubmitting ? (
              <span>Submitting…</span>
            ) : (
              <>
                <span>
                  Create budget <span className="rupee">₹</span>
                </span>
              </>
            )
          }
        </button>
      </fetcher.Form>
    </div>
  );
};
export default AddBudgetForm;