// rrd imports
import { redirect } from "react-router-dom";

// library
import { toast } from "react-toastify";

// helpers
import { deleteItem } from "../helpers";

export async function logoutAction() {
  localStorage.removeItem("token");
  localStorage.removeItem("userName");
  localStorage.removeItem("budgetbrain-avatar");
  toast.success("You've logged out successfully!");
  return redirect("/login");
}