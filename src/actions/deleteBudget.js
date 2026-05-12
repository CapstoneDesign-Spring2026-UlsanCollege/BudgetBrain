//* rrd import
// This function is likely used to navigate the user to a different route after the budget is 
// successfully deleted.
import { redirect } from "react-router-dom";

//* library
// The toast object is used to display notifications or toasts to the user.
import { toast } from "react-toastify";

//* helpers
import { deleteItem } from "../helpers";

export async function deleteBudget({ params }) {
  try {
    await deleteItem({
      key: "budgets",
      id: params.id,
    });

    toast.success("Budget deleted successfully!");
  } catch (e) {
    throw new Error("There was a problem deleting your budget.");
  }

  return redirect("/");
}
